import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrderById } from '../../api/order.api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError('');

      try {
        const response = await getOrderById(orderId);
        const item = response?.data?.data || response?.data;
        setOrder(item);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load order status');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div style={{ maxWidth: 640, margin: '4rem auto', textAlign: 'center' }}>
      <h2>Payment processing</h2>
      <p>Your payment request has been submitted. Please wait while the backend confirms the transaction.</p>

      {loading ? <p>Checking order status...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      {order ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginTop: '1rem' }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Payment status:</strong> {order.paymentStatus}</p>
          <p><strong>Order status:</strong> {order.status}</p>
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <Link to="/orders">My orders</Link>
        <Link to="/products">Continue shopping</Link>
      </div>
    </div>
  );
}
