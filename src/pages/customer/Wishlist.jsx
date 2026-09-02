import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../api/wishlist.api';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getWishlist();
      const data = response?.data?.data || response?.data || {};
      const products = Array.isArray(data.products) ? data.products : [];
      setItems(products);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from your wishlist?')) return;
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((current) => current.filter((item) => item._id !== productId));
    } catch {
      setError('Unable to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>Loading wishlist...</div>;
  }

  if (error) {
    return <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', color: 'crimson' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>My Wishlist & Followed Stores</h1>
      {items.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Your wishlist is empty.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {items.map((product) => (
            <div key={product._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: '100%', height: 180, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>{money(product.price)}</div>
                </div>
              </Link>
              <div style={{ padding: '0 0.75rem 0.75rem' }}>
                <button type="button" onClick={() => handleRemove(product._id)} disabled={removingId === product._id} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                  {removingId === product._id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
