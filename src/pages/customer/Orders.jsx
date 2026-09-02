import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, cancelOrder } from '../../api/order.api';

const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getOrders();
      const items = response?.data?.data || response?.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    setError('');

    try {
      await cancelOrder(orderId);
      setOrders((current) => current.map((order) => order._id === orderId ? { ...order, status: 'cancelled' } : order));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (order) => {
    if (order.status === 'cancelled') return false;
    if (['shipped', 'delivered'].includes(order.status)) return false;
    return true;
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 1.25rem' }}>My Orders</h2>
      {!orders.length ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div>
                  <strong>Order #{String(order._id).slice(-8)}</strong>
                </div>
                <div style={{ color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <div><span style={{ color: '#64748b' }}>Status: </span><strong>{order.status}</strong></div>
                <div><span style={{ color: '#64748b' }}>Payment: </span>{order.paymentStatus}</div>
                <div><span style={{ color: '#64748b' }}>Method: </span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe'}</div>
                <div><span style={{ color: '#64748b' }}>Items: </span>{order.items?.length || 0}</div>
                <div><span style={{ color: '#64748b' }}>Final amount: </span><strong>{money(order.finalAmount || order.totalAmount)}</strong></div>
                {order.shippingAddress ? (
                  <div style={{ color: '#64748b' }}>
                    Ships to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/orders/${order._id}`} style={{ display: 'inline-block', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#111827', textDecoration: 'none' }}>View details</Link>
                {canCancel(order) ? (
                  <button type="button" onClick={() => handleCancel(order._id)} disabled={cancellingId === order._id} style={{ background: '#9a2a22', color: '#fff', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 6, cursor: cancellingId === order._id ? 'not-allowed' : 'pointer' }}>
                    {cancellingId === order._id ? 'Cancelling...' : 'Cancel order'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
