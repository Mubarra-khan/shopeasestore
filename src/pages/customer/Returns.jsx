import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReturns } from '../../api/return.api';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReturns = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getReturns();
        const data = response?.data?.data || response?.data || [];
        setReturns(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load returns');
      } finally {
        setLoading(false);
      }
    };

    loadReturns();
  }, []);

  if (loading) {
    return <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>Loading returns...</div>;
  }

  if (error) {
    return <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', color: 'crimson' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>My Returns & Cancellations</h1>
      {returns.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          You have no return or cancellation requests.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {returns.map((item) => (
            <div key={item._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Order ID: {item.order?._id || item.order}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.status}</span></div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Refund: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.refundStatus}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{money(item.order?.totalAmount)}</span>
                {item.order?._id && <Link to={`/orders/${item.order._id}`} style={{ fontSize: '0.85rem', color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>View Order</Link>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
