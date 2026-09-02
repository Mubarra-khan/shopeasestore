import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReviews } from '../../api/auth.api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMyReviews();
        const data = response?.data?.data || response?.data || [];
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading) {
    return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>Loading reviews...</div>;
  }

  if (error) {
    return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', color: 'crimson' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>My Reviews</h1>
      {reviews.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          You have not reviewed any products yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reviews.map((review) => {
            const product = review.product || {};
            const seller = product.seller || {};
            const order = review.order || {};
            return (
              <div key={review._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Link to={product._id ? `/products/${product._id}` : '#'} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                  <div style={{ width: 80, height: 80, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name || 'Product'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No image</span>
                    )}
                  </div>
                </Link>
                <div style={{ flex: 1, display: 'grid', gap: '0.35rem' }}>
                  <Link to={product._id ? `/products/${product._id}` : '#'} style={{ textDecoration: 'none', color: '#111827', fontWeight: 600, fontSize: '0.95rem' }}>
                    {product.name || 'Unknown product'}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {seller?.name ? `Seller: ${seller.name}` : ''}
                    {order._id && (seller?.name ? ' · ' : '')}
                    {order._id && `Order #${String(order._id).slice(-8)}`}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  <div style={{ fontSize: '0.9rem', color: '#374151' }}>{review.comment}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(review.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
