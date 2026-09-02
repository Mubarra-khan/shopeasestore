import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getFilterOptions, getCategories, getSubcategories, getChildSubcategories } from '../../api/product.api';
import ProductCard from '../../components/ProductCard';
import MegaCategoryMenu from '../../components/MegaCategoryMenu';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const MORE_LESS_LIMIT = 8;
const PAGE_SIZE = 40;
const SEARCH_RESULT_LIMIT = 15;

const scoreRelevance = (name, query) => {
  if (!query) return 0;
  const lower = (name || '').toLowerCase().trim();
  if (lower === query) return 100;
  if (lower.startsWith(query)) return 80;
  const words = lower.split(/\s+/);
  if (words.includes(query)) return 70;
  if (lower.includes(query)) return 50;
  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.some((t) => lower.includes(t))) return 30;
  return 0;
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [childSubcategories, setChildSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [specOptions, setSpecOptions] = useState({});
  const [filterOptions, setFilterOptions] = useState({});

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const childSubcategory = searchParams.get('childSubcategory') || '';
  const seller = searchParams.get('seller') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') || '';
  const sort = searchParams.get('sort') || 'newest';
  const specBrand = searchParams.get('brand') || '';
  const specColor = searchParams.get('color') || '';
  const specMaterial = searchParams.get('material') || '';
  const specAge = searchParams.get('age') || '';
  const specWarrantyType = searchParams.get('warrantyType') || '';
  const specWarrantyPeriod = searchParams.get('warrantyPeriod') || '';
  const specDeliveryFrom = searchParams.get('deliveryFrom') || '';
  const specStorageRequirement = searchParams.get('storageRequirement') || '';

  useEffect(() => {
    const fetchFilters = async () => {
      if (!category) {
        setSubcategories([]);
        setFilterOptions({});
        try {
          const categoriesRes = await getCategories();
          setCategories(categoriesRes?.data?.data || []);
        } catch {
          // keep existing categories if fetch fails
        }
        return;
      }

      const categoriesPromise = getCategories();
      const filterOptionsPromise = getFilterOptions({ category });
      const subcategoriesPromise = getSubcategories(category);

      try {
        const categoriesRes = await categoriesPromise;
        setCategories(categoriesRes?.data?.data || []);
      } catch {
        // keep existing categories if fetch fails
      }

      try {
        const filterOptionsRes = await filterOptionsPromise;
        setFilterOptions(filterOptionsRes?.data?.data || {});
      } catch {
        // filter options are optional
      }

      try {
        const response = await subcategoriesPromise;
        setSubcategories(response?.data?.data || []);
      } catch {
        setSubcategories([]);
      }
    };

    fetchFilters();
  }, [category]);

  useEffect(() => {
    const fetchChildSubcategories = async () => {
      if (!subcategory) {
        setChildSubcategories([]);
        return;
      }

      try {
        const response = await getChildSubcategories(subcategory);
        setChildSubcategories(response?.data?.data || []);
      } catch {
        setChildSubcategories([]);
      }
    };

    fetchChildSubcategories();
  }, [subcategory]);

  useEffect(() => {
    if (!search || allSubcategories.length > 0 || categories.length === 0) return;
    let cancelled = false;
    const loadAllSubcategories = async () => {
      try {
        const results = await Promise.all(
          categories.map((cat) =>
            getSubcategories(cat._id).then((res) => res?.data?.data || [], () => [])
          )
        );
        if (!cancelled) setAllSubcategories(results.flat());
      } catch {
        // ignore
      }
    };
    loadAllSubcategories();
    return () => { cancelled = true; };
  }, [search, categories, allSubcategories]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const params = {
          search,
          category,
          subcategory,
          childSubcategory,
          minPrice,
          maxPrice,
          minRating,
          inStock,
          sort,
          page: '1',
          limit: String(PAGE_SIZE),
          brand: specBrand,
          color: specColor,
          material: specMaterial,
          age: specAge,
          warrantyType: specWarrantyType,
          warrantyPeriod: specWarrantyPeriod,
          deliveryFrom: specDeliveryFrom,
          storageRequirement: specStorageRequirement,
        };

        const response = await getProducts(params, { signal: controller.signal });
        const payload = response?.data || {};
        const items = Array.isArray(payload.data) ? payload.data : [];
        setProducts(items);
        setTotal(Number(payload.total || 0));
        setCurrentPage(1);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(err?.response?.data?.message || 'Unable to load products');
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, subcategory, childSubcategory, minPrice, maxPrice, minRating, inStock, sort, specBrand, specColor, specMaterial, specAge, specWarrantyType, specWarrantyPeriod, specDeliveryFrom, specStorageRequirement]);

  useEffect(() => {
    if (!products.length) {
      setSpecOptions({});
      return;
    }

    const fields = ['brand', 'color', 'material', 'age', 'warrantyType', 'warrantyPeriod', 'deliveryFrom', 'storageRequirement'];
    const options = {};
    fields.forEach((field) => {
      const values = products
        .map((p) => p[field])
        .filter((value) => value && String(value).trim())
        .map((value) => String(value).trim());
      options[field] = Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    });
    setSpecOptions(options);
  }, [products]);

  const updateFilter = (key, value) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = [search, category, subcategory, childSubcategory, seller, minPrice, maxPrice, minRating, inStock, specBrand, specColor, specMaterial, specAge, specWarrantyType, specWarrantyPeriod, specDeliveryFrom, specStorageRequirement].some(Boolean);

  const selectedCategoryObj = categories.find((c) => c._id === category);

  const breadcrumbItems = [];
  if (search) {
    breadcrumbItems.push({ label: 'Home', to: '/' });
    breadcrumbItems.push({ label: `Search: "${search}"` });
  } else if (category && selectedCategoryObj) {
    breadcrumbItems.push({ label: 'Home', to: '/' });
    breadcrumbItems.push({ label: selectedCategoryObj.name, to: `/products?category=${selectedCategoryObj._id}` });
    if (subcategory) {
      const sub = subcategories.find((s) => s._id === subcategory);
      if (sub) {
        breadcrumbItems.push({ label: sub.name });
      }
    }
  } else if (subcategory) {
    const sub = subcategories.find((s) => s._id === subcategory);
    if (sub) {
      const parentCat = categories.find((c) => c._id === sub.category);
      breadcrumbItems.push({ label: 'Home', to: '/' });
      if (parentCat) {
        breadcrumbItems.push({ label: parentCat.name, to: `/products?category=${parentCat._id}` });
      }
      breadcrumbItems.push({ label: sub.name });
    }
  } else {
    breadcrumbItems.push({ label: 'Home', to: '/' });
    breadcrumbItems.push({ label: 'All Products' });
  }

  const searchQuery = search.trim().toLowerCase();
  const searchResultCategories = useMemo(() => {
    if (!searchQuery || !categories.length) return [];
    return categories
      .filter((cat) => cat.isActive !== false && scoreRelevance(cat.name, searchQuery) > 0)
      .sort((a, b) => {
        const diff = scoreRelevance(b.name, searchQuery) - scoreRelevance(a.name, searchQuery);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      })
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [categories, searchQuery]);

  const searchResultSubcategories = useMemo(() => {
    if (!searchQuery || !allSubcategories.length) return [];
    return allSubcategories
      .filter((s) => !s.parent && s.isActive !== false && scoreRelevance(s.name, searchQuery) > 0)
      .sort((a, b) => {
        const diff = scoreRelevance(b.name, searchQuery) - scoreRelevance(a.name, searchQuery);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      })
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [allSubcategories, searchQuery]);

  const searchResultChildSubcategories = useMemo(() => {
    if (!searchQuery || !allSubcategories.length) return [];
    return allSubcategories
      .filter((s) => s.parent && s.isActive !== false && scoreRelevance(s.name, searchQuery) > 0)
      .sort((a, b) => {
        const diff = scoreRelevance(b.name, searchQuery) - scoreRelevance(a.name, searchQuery);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      })
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [allSubcategories, searchQuery]);

  const sidebarItems = useMemo(() => {
    if (search) {
      const cats = searchResultCategories.map((item) => ({ ...item, _type: 'category' }));
      const subs = searchResultSubcategories.map((item) => ({ ...item, _type: 'subcategory' }));
      const children = searchResultChildSubcategories.map((item) => ({ ...item, _type: 'child' }));
      let items = [...cats, ...subs, ...children].sort((a, b) => {
        const scoreA = scoreRelevance(a.name, searchQuery);
        const scoreB = scoreRelevance(b.name, searchQuery);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.name.localeCompare(b.name);
      });

      if (items.length < 8) {
        const seen = new Set(items.map((i) => `${i._type}-${i._id}`));
        const fallback = [
          ...categories.filter((c) => !seen.has(`category-${c._id}`)).map((c) => ({ ...c, _type: 'category' })),
          ...allSubcategories.filter((s) => !seen.has(`subcategory-${s._id}`) && !s.parent).map((s) => ({ ...s, _type: 'subcategory' })),
          ...allSubcategories.filter((s) => !seen.has(`child-${s._id}`) && s.parent).map((s) => ({ ...s, _type: 'child' })),
        ];
        const maxFallback = Math.max(0, 28 - items.length);
        items = [...items, ...fallback.slice(0, maxFallback)];
      }

      return items.slice(0, 28);
    }
    if (category) {
      const catSubs = subcategories.filter((s) => s.category === category && !s.parent);
      const subChildren = subcategory ? childSubcategories.filter((c) => c.parent === subcategory) : [];
      const relevant = [
        ...catSubs.map((s) => ({ ...s, _type: 'subcategory' })),
        ...subChildren.map((c) => ({ ...c, _type: 'child' })),
      ];

      if (relevant.length >= 8) return relevant;

      const seen = new Set(relevant.map((i) => `${i._type}-${i._id}`));
      const fallback = categories
        .filter((c) => !seen.has(`category-${c._id}`))
        .map((c) => ({ ...c, _type: 'category' }));

      const maxFallback = Math.max(0, 28 - relevant.length);
      return [...relevant, ...fallback.slice(0, maxFallback)];
    }
    return [];
  }, [search, category, searchQuery, searchResultCategories, searchResultSubcategories, searchResultChildSubcategories, subcategories, childSubcategories, subcategory, categories, allSubcategories]);

  const changePage = async (nextPage) => {
    if (loadingMore || nextPage === currentPage) return;
    setLoadingMore(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const params = {
        search,
        category,
        subcategory,
        childSubcategory,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        sort,
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      };

      const response = await getProducts(params, { signal: controller.signal });
      const payload = response?.data || {};
      const items = Array.isArray(payload.data) ? payload.data : [];
      setProducts(items);
      setTotal(Number(payload.total || 0));
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    } finally {
      clearTimeout(timeoutId);
      setLoadingMore(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.25rem 2rem' }}>
      <style>{`
        .product-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          height: 300px;
        }
        .product-card .img-wrap {
          position: relative;
          width: 100%;
          flex: 0 0 65%;
          min-width: 0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-card .img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .product-card .img-wrap img.broken {
          display: none;
        }
        .product-card .img-wrap .placeholder {
          display: none;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 0.75rem;
          text-align: center;
          padding: 0.5rem;
        }
        .product-card .img-wrap img.broken + .placeholder {
          display: flex;
        }
        .product-card .body {
          padding: 0.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }
        .product-card .name {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #111827;
        }
        .product-card .price-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;
          flex-wrap: wrap;
        }
        .product-card .sale {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f97316;
        }
        .product-card .original {
          font-size: 0.8rem;
          color: #9ca3af;
          text-decoration: line-through;
        }
        .product-card .badge {
          background: #e5e7eb;
          color: #6b7280;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
        }
        .product-card .regular-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f97316;
        }
        .sidebar-category-item:hover {
          color: #f97316 !important;
        }
        .sidebar-filter-item input[type="checkbox"] {
          -webkit-appearance: none;
          appearance: none;
          width: 13px;
          height: 13px;
          border: 1px solid #000;
          background: #fff;
          cursor: pointer;
          flex-shrink: 0;
        }
        .sidebar-filter-item input[type="checkbox"]:hover {
          border-color: #38bdf8;
        }
        .sidebar-filter-item input[type="checkbox"]:checked {
          background: #f97316;
          border-color: #f97316;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 5l2.5 2.5L8 2' stroke='white' stroke-width='1.2' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
        }
        @media (max-width: 1200px) {
          .product-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 768px) {
          .products-layout { grid-template-columns: 1fr !important; }
          .products-filters { display: none; }
          .products-filters.open { display: block; }
          .products-mobile-toggle { display: inline-flex !important; }
          .product-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <MegaCategoryMenu categories={categories} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.1rem', fontSize: '1.2rem', fontWeight: 700 }}>
            {search ? search : category ? (selectedCategoryObj?.name || 'Products') : 'All Products'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
            {loading ? 'Searching...' : `${total} product${total === 1 ? '' : 's'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} style={{ padding: '0.35rem 0.6rem', border: '1px solid #d8e2dc', borderRadius: 6, fontSize: '0.8rem' }}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => setMobileFiltersOpen((open) => !open)} className="products-mobile-toggle" style={{ display: 'none', background: '#fff', border: '1px solid #cbd5e1', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            {mobileFiltersOpen ? 'Hide filters' : 'Filters'}
          </button>
        </div>
      </div>

      <div className="products-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', alignItems: 'start' }}>
        <aside className={`products-filters${mobileFiltersOpen ? ' open' : ''}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              {sidebarItems.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gap: '0.05rem' }}>
                    {(sidebarExpanded ? sidebarItems : sidebarItems.slice(0, MORE_LESS_LIMIT)).map((item) => {
                      const isActive = item._type === 'category'
                        ? category === item._id
                        : item._type === 'subcategory'
                          ? subcategory === item._id
                          : childSubcategory === item._id;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          className="sidebar-category-item"
                          onClick={() => {
                            if (item._type === 'category') {
                              updateFilter('category', item._id);
                              updateFilter('subcategory', '');
                              updateFilter('childSubcategory', '');
                            } else if (item._type === 'subcategory') {
                              if (item.category) updateFilter('category', item.category);
                              updateFilter('subcategory', item._id);
                              updateFilter('childSubcategory', '');
                            } else {
                              if (item.category) updateFilter('category', item.category);
                              if (item.parent) updateFilter('subcategory', item.parent);
                              updateFilter('childSubcategory', item._id);
                            }
                          }}
                          style={{
                            background: isActive ? '#f1f5f9' : 'transparent',
                            border: 'none',
                            padding: '0.35rem 0.5rem',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            color: '#111827',
                            fontWeight: isActive ? 600 : 400,
                            width: '100%',
                          }}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                  {sidebarItems.length > MORE_LESS_LIMIT && (
                    <button type="button" onClick={() => setSidebarExpanded((prev) => !prev)} style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0.35rem 0.5rem', marginTop: '0.25rem', width: '100%', textAlign: 'left' }}>
                      {sidebarExpanded ? '− Show Less' : '+ Show More'}
                    </button>
                  )}
                </>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>Min price</label>
                <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #d8e2dc', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>Max price</label>
                <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} placeholder="Any" style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #d8e2dc', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>Minimum rating</label>
              <select value={minRating} onChange={(e) => updateFilter('minRating', e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #d8e2dc', borderRadius: 6, fontSize: '0.8rem' }}>
                <option value="">Any rating</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
                <option value="1">1★ & above</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="checkbox" id="inStock" checked={inStock === 'true'} onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')} style={{ width: 13, height: 13, accentColor: '#f97316' }} />
              <label htmlFor="inStock" style={{ fontSize: '0.8rem', fontWeight: 600 }}>In stock only</label>
            </div>

            {(() => {
              const mergedFields = ['brand', 'color', 'material', 'age', 'service', 'promotion', 'deliveryFrom', 'warrantyType', 'warrantyPeriod', 'storageRequirement'];
              return mergedFields.map((field) => {
                const backendValues = Array.isArray(filterOptions[field]) ? filterOptions[field] : [];
                const pageValues = Array.isArray(specOptions[field]) ? specOptions[field] : [];
                const values = Array.from(new Set([...backendValues, ...pageValues])).sort((a, b) => a.localeCompare(b));
                const currentFilter = searchParams.get(field) || '';
                if (!values.length) return null;
                return (
                  <div key={field}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem', textTransform: 'capitalize' }}>{field}</div>
                    <div style={{ display: 'grid', gap: '0.15rem' }}>
                      {values.map((value) => (
                        <label key={value} className="sidebar-filter-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.15rem 0' }}>
                          <input
                            type="checkbox"
                            checked={currentFilter === value}
                            onChange={(e) => updateFilter(field, e.target.checked ? value : '')}
                            style={{ width: 13, height: 13 }}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} style={{ background: '#fff', color: '#111827', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', width: '100%' }}>
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '100%', height: 180, background: '#e5e7eb', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ width: '60%', height: 10, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ width: '90%', height: 12, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ color: 'crimson', marginBottom: '0.75rem' }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.95rem' }}>No products found</p>
              <p style={{ color: '#64748b', marginBottom: '0.75rem', fontSize: '0.85rem' }}>Try a different search term or remove some filters.</p>
              {hasActiveFilters && <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="product-grid-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1 || loadingMore}
                    style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, cursor: currentPage === 1 || loadingMore ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}
                  >
                    ‹
                  </button>
                  {currentPage > 3 && totalPages > 5 && (
                    <>
                      <button type="button" onClick={() => changePage(1)} disabled={loadingMore} style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', borderRadius: 6, cursor: loadingMore ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>1</button>
                      {currentPage > 4 && <span style={{ color: '#64748b' }}>...</span>}
                    </>
                  )}
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => changePage(pageNum)}
                      disabled={loadingMore}
                      style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: pageNum === currentPage ? '#f97316' : '#fff', borderRadius: 6, cursor: loadingMore ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: pageNum === currentPage ? '#fff' : '#111827' }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      {currentPage < totalPages - 3 && <span style={{ color: '#64748b' }}>...</span>}
                      <button type="button" onClick={() => changePage(totalPages)} disabled={loadingMore} style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', borderRadius: 6, cursor: loadingMore ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{totalPages}</button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages || loadingMore}
                    style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, cursor: currentPage === totalPages || loadingMore ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
