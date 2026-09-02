import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/product.api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getCategories();
        const items = response?.data?.data || response?.data || [];
        const active = items.filter((cat) => cat.isActive !== false);
        setCategories(active);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem 1.5rem 2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Categories</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Browse products by category</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '100%', height: 100, background: '#e5e7eb', animation: 'pulse 1.5s infinite' }} />
              <div style={{ padding: '0.5rem' }}>
                <div style={{ width: '60%', height: 10, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>No categories found</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Please check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {categories.map((category) => (
            <Link key={category._id} to={`/products?category=${encodeURIComponent(category._id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', textAlign: 'center', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: '100%', height: 100, background: category.image ? `url(${category.image})` : '#f1f5f9', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111827', lineHeight: 1.2 }}>{category.name}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
