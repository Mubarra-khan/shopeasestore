import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrderByStripeSessionId } from '../../api/order.api';
import { useCart } from '../../context/CartContext';

const MAX_POLL_MS = 30000;
const POLL_INTERVAL_MS = 1500;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { fetchCart } = useCart();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    let active = true;
    const startTime = Date.now();

    const tryFetch = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getOrderByStripeSessionId(sessionId);
        const item = response?.data?.data || response?.data;
        if (!active) return;

        setOrder(item);

        if (item && item.paymentStatus === 'paid') {
          await fetchCart();
          return;
        }
      } catch (err) {
        if (!active) return;
        const status = err?.response?.status;
        if (status === 404 && Date.now() - startTime < MAX_POLL_MS) {
          setTimeout(tryFetch, POLL_INTERVAL_MS);
          return;
        }
        setError(err?.response?.data?.message || 'Unable to load order status');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    tryFetch();

    return () => {
      active = false;
    };
  }, [sessionId, fetchCart]);

  const confirming = !order && !error;
  const timedOut = confirming && !loading;

  return (
    <div style={{ maxWidth: 640, margin: '4rem auto', textAlign: 'center' }}>
      <h2>Payment processing</h2>

      {confirming ? (
        <p>Payment received. Confirming your order...</p>
      ) : (
        <p>Your payment request has been submitted. Please wait while the backend confirms the transaction.</p>
      )}

      {loading ? <p>Checking order status...</p> : null}
      {timedOut ? (
        <p style={{ color: '#6c8177' }}>
          Payment was received, but order confirmation is still processing.
          <br />
          <Link to="/orders">Check my orders</Link> or refresh this page shortly.
        </p>
      ) : null}
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
