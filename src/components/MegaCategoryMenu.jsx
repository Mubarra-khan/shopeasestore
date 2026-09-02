import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategories, getSubcategories, getChildSubcategories } from '../api/product.api';

const CATEGORIES_PER_COLUMN = 12;
const SUBCATEGORIES_PER_CARD = 12;
const CARD_WIDTH = 240;

export default function MegaCategoryMenu({ categories: propCategories = [] }) {
  const location = useLocation();
  const [internalCategories, setInternalCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [childSubcategoriesMap, setChildSubcategoriesMap] = useState({});
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState(null);
  const [hoveredChildSubcategoryId, setHoveredChildSubcategoryId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingSubcats, setLoadingSubcats] = useState({});
  const [loadingChildSubcats, setLoadingChildSubcats] = useState({});
  const menuRef = useRef(null);
  const inFlightRef = useRef({});
  const childInFlightRef = useRef({});
  const cachedSubcatsRef = useRef({});
  const cachedChildSubcatsRef = useRef({});

  const isProductsPage = location.pathname.startsWith('/products');
  const categories = useMemo(() => (propCategories.length > 0 ? propCategories : internalCategories), [propCategories, internalCategories]);

  useEffect(() => {
    if (!isProductsPage) return;
    if (propCategories.length > 0 || internalCategories.length > 0) return;
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response?.data?.data || [];
        if (!cancelled) setInternalCategories(data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, [isProductsPage, propCategories, internalCategories]);

  const fetchSubcategories = useCallback(async (categoryId) => {
    if (cachedSubcatsRef.current[categoryId] || inFlightRef.current[categoryId]) return;
    inFlightRef.current[categoryId] = true;
    setLoadingSubcats((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const response = await getSubcategories(categoryId);
      const data = response?.data?.data || [];
      cachedSubcatsRef.current[categoryId] = data;
      setSubcategoriesMap((prev) => ({ ...prev, [categoryId]: data }));
    } catch {
      // ignore
    } finally {
      inFlightRef.current[categoryId] = false;
      setLoadingSubcats((prev) => ({ ...prev, [categoryId]: false }));
    }
  }, []);

  const fetchChildSubcategories = useCallback(async (subcategoryId) => {
    if (cachedChildSubcatsRef.current[subcategoryId] || childInFlightRef.current[subcategoryId]) return;
    childInFlightRef.current[subcategoryId] = true;
    setLoadingChildSubcats((prev) => ({ ...prev, [subcategoryId]: true }));
    try {
      const response = await getChildSubcategories(subcategoryId);
      const data = response?.data?.data || [];
      cachedChildSubcatsRef.current[subcategoryId] = data;
      setChildSubcategoriesMap((prev) => ({ ...prev, [subcategoryId]: data }));
    } catch {
      // ignore
    } finally {
      childInFlightRef.current[subcategoryId] = false;
      setLoadingChildSubcats((prev) => ({ ...prev, [subcategoryId]: false }));
    }
  }, []);

  const preloadSubcategories = useCallback((categoryIds) => {
    categoryIds.forEach((id) => fetchSubcategories(id));
  }, [fetchSubcategories]);

  useEffect(() => {
    if (!isOpen) return;
    const visibleIds = categories.map((c) => c._id);
    preloadSubcategories(visibleIds);
  }, [isOpen, categories, preloadSubcategories]);

  const handleCategoryHover = useCallback((categoryId) => {
    setHoveredCategoryId((prev) => {
      if (prev === categoryId) return prev;
      fetchSubcategories(categoryId);
      return categoryId;
    });
    setHoveredSubcategoryId(null);
  }, [fetchSubcategories]);

  const handleSubcategoryHover = useCallback((subcategoryId) => {
    setHoveredSubcategoryId((prev) => {
      if (prev === subcategoryId) return prev;
      fetchChildSubcategories(subcategoryId);
      return subcategoryId;
    });
    setHoveredChildSubcategoryId(null);
  }, [fetchChildSubcategories]);

  const handleChildSubcategoryHover = useCallback((childSubcategoryId) => {
    setHoveredChildSubcategoryId((prev) => (prev === childSubcategoryId ? prev : childSubcategoryId));
  }, []);

  const handleCategoryClick = (categoryId) => {
    setIsOpen(false);
    window.location.href = `/products?category=${categoryId}`;
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    setIsOpen(false);
    window.location.href = `/products?category=${categoryId}&subcategory=${subcategoryId}`;
  };

  const handleChildSubcategoryClick = (categoryId, subcategoryId, childSubcategoryId) => {
    setIsOpen(false);
    window.location.href = `/products?category=${categoryId}&subcategory=${subcategoryId}&childSubcategory=${childSubcategoryId}`;
  };

  const column1 = useMemo(() => categories.slice(0, CATEGORIES_PER_COLUMN), [categories]);
  const subcategories = hoveredCategoryId ? (subcategoriesMap[hoveredCategoryId] || []) : [];
  const column2 = useMemo(() => subcategories.slice(0, SUBCATEGORIES_PER_CARD), [subcategories]);
  const childSubcategories = hoveredSubcategoryId ? (childSubcategoriesMap[hoveredSubcategoryId] || []) : [];
  const column3 = useMemo(() => childSubcategories.slice(0, SUBCATEGORIES_PER_CARD), [childSubcategories]);
  const showCard2 = !!hoveredCategoryId && (subcategoriesMap[hoveredCategoryId] || []).length > 0;
  const showCard3 = !!hoveredSubcategoryId && (childSubcategoriesMap[hoveredSubcategoryId] || []).length > 0;

  if (!isProductsPage) return null;

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onMouseEnter={() => setIsOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#111827',
          padding: '0.35rem 0',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        Categories
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
          <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              display: 'inline-flex',
              height: '370px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              zIndex: 9999,
              overflow: 'hidden',
              flexShrink: 0,
              gap: 0,
            }}
          >
          <div style={{ width: CARD_WIDTH, borderRight: showCard2 ? '1px solid #e5e7eb' : 'none', padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gap: '0.05rem', flex: 1, overflow: 'hidden' }}>
              {column1.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onMouseEnter={() => handleCategoryHover(cat._id)}
                  onClick={() => handleCategoryClick(cat._id)}
                  style={{
                    background: hoveredCategoryId === cat._id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    color: hoveredCategoryId === cat._id ? '#f97316' : '#111827',
                    fontWeight: hoveredCategoryId === cat._id ? 600 : 400,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                  {hoveredCategoryId === cat._id && (
                    <span style={{ color: '#f97316', fontSize: '0.85rem', lineHeight: 1 }}>&gt;</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {showCard2 && (
            <div style={{ width: CARD_WIDTH, borderRight: showCard3 ? '1px solid #e5e7eb' : 'none', padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              {loadingSubcats[hoveredCategoryId] && !subcategoriesMap[hoveredCategoryId] ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading...</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.2rem', flex: 1, overflow: 'hidden' }}>
                  {column2.map((sub) => (
                    <button
                      key={sub._id}
                      type="button"
                      onMouseEnter={() => handleSubcategoryHover(sub._id)}
                      onClick={() => handleSubcategoryClick(hoveredCategoryId, sub._id)}
                      style={{
                        background: hoveredSubcategoryId === sub._id ? '#f1f5f9' : 'transparent',
                        border: 'none',
                        padding: '0.3rem 0.5rem',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        color: hoveredSubcategoryId === sub._id ? '#f97316' : '#374151',
                        fontWeight: hoveredSubcategoryId === sub._id ? 600 : 400,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</span>
                      {hoveredSubcategoryId === sub._id && (
                        <span style={{ color: '#f97316', fontSize: '0.85rem', lineHeight: 1 }}>&gt;</span>
                      )}
                    </button>
                  ))}
                  {subcategories.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No subcategories.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {showCard3 && (
            <div style={{ width: CARD_WIDTH, padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              {loadingChildSubcats[hoveredSubcategoryId] && !childSubcategoriesMap[hoveredSubcategoryId] ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading...</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.2rem', flex: 1, overflow: 'hidden' }}>
                  {column3.map((sub) => (
                    <button
                      key={sub._id}
                      type="button"
                      onMouseEnter={() => handleChildSubcategoryHover(sub._id)}
                      onClick={() => handleChildSubcategoryClick(hoveredCategoryId, hoveredSubcategoryId, sub._id)}
                      style={{
                        background: hoveredChildSubcategoryId === sub._id ? '#f1f5f9' : 'transparent',
                        border: 'none',
                        padding: '0.3rem 0.5rem',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        color: hoveredChildSubcategoryId === sub._id ? '#f97316' : '#374151',
                        fontWeight: hoveredChildSubcategoryId === sub._id ? 600 : 400,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</span>
                      {hoveredChildSubcategoryId === sub._id && (
                        <span style={{ color: '#f97316', fontSize: '0.85rem', lineHeight: 1 }}>&gt;</span>
                      )}
                    </button>
                  ))}
                  {childSubcategories.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No child subcategories.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
