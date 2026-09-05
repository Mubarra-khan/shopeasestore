import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const STAR_COUNT = 5;

function getStarColor(index, rating) {
  if (index < Math.floor(rating)) return '#f97316';
  if (index < rating) return '#f97316';
  return '#d1d5db';
}

const normalizeProductImage = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://localhost:5000/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const origin = apiUrl.replace(/\/api\/?$/, '');
    return url.replace('http://localhost:5000', origin);
  }
  return url;
};

export default function ProductCard({ product, compact }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const normalizedImage = normalizeProductImage(product.image);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAdding(true);
    await addItem(product._id, 1);
    setAdding(false);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const ratingValue = Number(product.averageRating || 0);
  const hasRating = product.reviewCount > 0 || ratingValue > 0;

  return (
    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card" style={{
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div className="img-wrap" style={{ position: 'relative', width: '100%', flex: '0 0 65%', minHeight: 135, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {!imgError ? (
            <img
              src={normalizedImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : null}
          <div className="placeholder" style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>
            {product.name}
            <br />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Image unavailable</span>
          </div>
          {product.stock <= 0 && (
            <span style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: '#dc2626',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              zIndex: 2,
            }}>Out of stock</span>
          )}
        </div>

        <div className="body" style={{ width: '100%', minWidth: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '0.4rem', gap: '0.2rem' }}>
          <p className="name" style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#111827' }}>{product.name}</p>
          <div className="price-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            {hasDiscount ? (
              <>
                <strong className="sale" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f97316' }}>{money(product.price)}</strong>
                <span className="original" style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'line-through' }}>{money(product.originalPrice)}</span>
                <span className="badge" style={{ background: '#e5e7eb', color: '#6b7280', padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>-{discountPercent}%</span>
              </>
            ) : (
              <strong className="regular-price" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f97316' }}>{money(product.price)}</strong>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: STAR_COUNT }).map((_, i) => (
                <span key={i} style={{ color: getStarColor(i, ratingValue), fontSize: '0.8rem', lineHeight: 1 }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
              {hasRating ? `(${ratingValue.toFixed(1)})` : 'No rating'}
            </span>
          </div>
          {!compact && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || adding}
              style={{
                marginTop: '0.35rem',
                width: '100%',
                padding: '0.4rem',
                borderRadius: 6,
                border: 'none',
                 background: product.stock <= 0 ? '#e5e7eb' : '#F85606',
                color: product.stock <= 0 ? '#9ca3af' : '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: product.stock <= 0 || adding ? 'not-allowed' : 'pointer',
              }}
            >
              {adding ? 'Adding...' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
