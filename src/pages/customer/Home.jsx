import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../../api/product.api';
import { getBanners } from '../../api/banner.api';
import ProductCard from '../../components/ProductCard';

const PER_ROW = 6;
const INITIAL_ROWS = 4;
const PAGE_SIZE = PER_ROW * INITIAL_ROWS;

const Section = ({ title, subtitle, children }) => (
  <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1.5rem' }}>
    <div style={{ marginBottom: '0.75rem' }}>
      <h2 style={{ margin: '0 0 0.15rem', fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
      {subtitle && <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{subtitle}</p>}
    </div>
    {children}
  </section>
);

const SkeletonCard = () => (
  <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
    <div style={{ width: '100%', height: 160, background: '#e5e7eb', animation: 'pulse 1.5s infinite' }} />
    <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ width: '60%', height: 10, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '90%', height: 12, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  </div>
);

const HeroSlider = ({ banners }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    if (paused) clearInterval(timer);
    return () => clearInterval(timer);
  }, [banners.length, paused]);

  if (!banners.length) {
    return (
      <section style={{ position: 'relative', background: '#0f172a', color: '#fff', overflow: 'hidden', aspectRatio: '1920 / 500' }}>
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80" alt="" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem', display: 'grid', gap: '2rem', alignItems: 'center' }} >
          <div style={{ maxWidth: 600 }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#94a3b8', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>Welcome to ShopEase</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem' }}>
              Discover deals you&apos;ll love
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: '0 0 2rem', lineHeight: 1.6 }}>
              Shop quality products from trusted sellers with fast delivery and secure checkout.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: 360, justifySelf: 'end' }}>
            {[
              { label: 'Trusted Sellers', value: '100+' },
              { label: 'Products', value: '500+' },
              { label: 'Happy Customers', value: '10k+' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[current];
  return (
    <section
      style={{ position: 'relative', background: '#0f172a', color: '#fff', overflow: 'hidden', aspectRatio: '1920 / 500' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((item, index) => (
        <img
          key={item._id}
          src={item.image}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: index === current ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem', display: 'grid', gap: '2rem', alignItems: 'center' }}>
        <div style={{ maxWidth: 600 }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#94a3b8', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>{banner.title}</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem' }}>
            {banner.subtitle || 'Discover deals you\'ll love'}
          </h1>
          {banner.buttonText && banner.link ? (
            <Link to={banner.link} style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.85rem 1.5rem', borderRadius: 8, background: '#fff', color: '#111827', fontWeight: 700, textDecoration: 'none' }}>
              {banner.buttonText}
            </Link>
          ) : null}
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: '1.5rem', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              style={{
                width: index === current ? 24 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                background: index === current ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'width 0.3s ease',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [justForYouPage, setJustForYouPage] = useState(1);
  const [justForYouLoading, setJustForYouLoading] = useState(false);
  const [justForYouProducts, setJustForYouProducts] = useState([]);
  const [hasMoreJustForYou, setHasMoreJustForYou] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [productsRes, categoriesRes, bannersRes] = await Promise.all([getProducts({ limit: String(PAGE_SIZE) }), getCategories(), getBanners()]);
        const items = productsRes?.data?.data || productsRes?.data || [];
        setProducts(Array.isArray(items) ? items : []);
        const categoryItems = categoriesRes?.data?.data || categoriesRes?.data || [];
        setCategories(categoryItems.filter((cat) => cat.isActive !== false));
        const bannerItems = bannersRes?.data?.data || bannersRes?.data || [];
        setBanners(Array.isArray(bannerItems) ? bannerItems : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const discountedProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);
  const onSaleProducts = discountedProducts.slice(0, 6);

  const homeCategories = categories.slice(0, 8);

  const loadMoreJustForYou = async () => {
    if (justForYouLoading || !hasMoreJustForYou) return;
    setJustForYouLoading(true);
    try {
      const nextPage = justForYouPage + 1;
      const response = await getProducts({ page: String(nextPage), limit: String(PAGE_SIZE) });
      const items = response?.data?.data || response?.data || [];
      const newProducts = Array.isArray(items) ? items : [];
      setJustForYouProducts((prev) => [...prev, ...newProducts]);
      setJustForYouPage(nextPage);
      setHasMoreJustForYou(newProducts.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setJustForYouLoading(false);
    }
  };

  useEffect(() => {
    setJustForYouProducts(products.slice(0, PAGE_SIZE));
    setJustForYouPage(1);
    setHasMoreJustForYou(products.length >= PAGE_SIZE);
  }, [products]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1rem;
          width: 100%;
          min-width: 0;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 0.75rem;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
          height: 300px;
        }
        .product-card .img-wrap {
          position: relative;
          width: 100%;
          flex: 0 0 65%;
          min-width: 0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-card .img-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }
        .product-card .body {
          width: 100%;
          min-width: 0;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 0.4rem;
          gap: 0.2rem;
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
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
          .category-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .category-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 767px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <HeroSlider banners={banners} />

      {onSaleProducts.length > 0 && (
        <Section title="On Sale" subtitle="Limited-time discounts you don't want to miss">
          <div className="product-grid">
            {onSaleProducts.map((product) => (
               <ProductCard key={product._id} product={product} compact />
            ))}
          </div>
        </Section>
      )}

      {homeCategories.length > 0 && (
        <Section title="Top Categories">
          <div className="category-grid">
            {homeCategories.map((cat) => (
              <Link key={cat._id} to={`/products?category=${encodeURIComponent(cat._id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', textAlign: 'center', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: '100%', height: 100, background: cat.image ? `url(${cat.image})` : '#f1f5f9', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: '0.5rem', minHeight: '2.6rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111827', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Just For You" subtitle="Handpicked products just for you">
        {justForYouProducts.length === 0 ? (
          <p style={{ color: '#64748b' }}>No products available right now.</p>
        ) : (
          <>
            <div className="product-grid">
              {justForYouProducts.map((product) => (
               <ProductCard key={product._id} product={product} compact />
              ))}
            </div>
            {hasMoreJustForYou && (
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={loadMoreJustForYou}
                  disabled={justForYouLoading}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: justForYouLoading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}
                >
                  {justForYouLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
