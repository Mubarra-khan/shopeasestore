import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById, cancelOrder, getOrderReviewStatus } from '../../api/order.api';
import { createReturn } from '../../api/return.api';

const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState([]);
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getOrderById(orderId);
        const item = response?.data?.data || response?.data;
        setOrder(item);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      if (!orderId || !order || order.status !== 'delivered') {
        setReviewStatus([]);
        return;
      }

      setReviewStatusLoading(true);
      try {
        const response = await getOrderReviewStatus(orderId);
        const data = response?.data?.data || [];
        setReviewStatus(Array.isArray(data) ? data : []);
      } catch {
        setReviewStatus([]);
      } finally {
        setReviewStatusLoading(false);
      }
    };

    fetchReviewStatus();
  }, [orderId, order?.status]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    setError('');

    try {
      await cancelOrder(orderId);
      setOrder((current) => current ? { ...current, status: 'cancelled' } : current);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order && order.status !== 'cancelled' && !['shipped', 'delivered'].includes(order.status);
  const canReturn = order && order.status === 'delivered';

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      setError('Please provide a return reason');
      return;
    }

    setReturning(true);
    setError('');

    try {
      await createReturn({ orderId, reason: returnReason.trim() });
      setIsReturnOpen(false);
      setReturnReason('');
      alert('Return request submitted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit return request');
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <div><p style={{ color: 'crimson' }}>{error}</p><Link to="/orders">Back to orders</Link></div>;
  if (!order) return <p>Order not found.</p>;

  const returnForOrder = order.returns && order.returns.length > 0 ? order.returns[0] : null;

  return (
    <div>
      <Link to="/orders">← Back to orders</Link>
      <h2 style={{ margin: '1rem 0 1.25rem' }}>Order #{String(order._id).slice(-8)}</h2>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Summary</h3>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <div><span style={{ color: '#64748b' }}>Date: </span>{new Date(order.createdAt).toLocaleString()}</div>
            <div><span style={{ color: '#64748b' }}>Status: </span><strong>{order.status}</strong></div>
            <div><span style={{ color: '#64748b' }}>Payment: </span>{order.paymentStatus}</div>
            <div><span style={{ color: '#64748b' }}>Method: </span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe'}</div>
            <div><span style={{ color: '#64748b' }}>Coupon: </span>{order.couponCode || 'None'}</div>
            <div><span style={{ color: '#64748b' }}>Subtotal: </span>{money(order.totalAmount)}</div>
            <div><span style={{ color: '#64748b' }}>Discount: </span>-{money(order.discountAmount)}</div>
            <div><span style={{ color: '#64748b' }}>Final: </span><strong>{money(order.finalAmount)}</strong></div>
          </div>
        </div>

        {order.shippingAddress ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Shipping address</h3>
            <div style={{ display: 'grid', gap: '0.2rem' }}>
              <div>{order.shippingAddress.fullName}</div>
              <div>{order.shippingAddress.phone}</div>
              <div>{order.shippingAddress.addressLine}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
              <div>{order.shippingAddress.country}</div>
            </div>
          </div>
        ) : null}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Items</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {order.items?.map((item, index) => {
              const reviewInfo = reviewStatus.find((r) => r.productId === (item.product?._id || item.product)?.toString());
              const hasReviewed = Boolean(reviewInfo?.hasReviewed);
              return (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: index < (order.items?.length || 0) - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: index < (order.items?.length || 0) - 1 ? '0.75rem' : 0, alignItems: 'center' }}>
                  <div>
                    <div><strong>{item.productName}</strong></div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Qty {item.quantity} · {money(item.price)} each</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <strong>{money(item.subtotal)}</strong>
                    </div>
                    {order.status === 'delivered' && !reviewStatusLoading && (
                      hasReviewed ? (
                        <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>Reviewed ✓</span>
                      ) : (
                        <Link to={`/products/${item.product?._id || item.product}`} style={{ display: 'inline-block', padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid #111827', color: '#111827', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>⭐ Review</Link>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {returnForOrder ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Return / Refund</h3>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <div><span style={{ color: '#64748b' }}>Status: </span><strong>{returnForOrder.status}</strong></div>
              <div><span style={{ color: '#64748b' }}>Reason: </span>{returnForOrder.reason}</div>
              {returnForOrder.refundAmount ? <div><span style={{ color: '#64748b' }}>Refund: </span>{money(returnForOrder.refundAmount)}</div> : null}
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canCancel ? (
            <button type="button" onClick={handleCancel} disabled={cancelling} style={{ background: '#9a2a22', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: cancelling ? 'not-allowed' : 'pointer' }}>
              {cancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          ) : null}
          {canReturn ? (
            !isReturnOpen ? (
              <button type="button" onClick={() => setIsReturnOpen(true)} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer' }}>
                Request return
              </button>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', width: '100%' }}>
                <h4 style={{ margin: '0 0 0.75rem' }}>Request return</h4>
                <textarea value={returnReason} onChange={(event) => setReturnReason(event.target.value)} rows={3} placeholder="Please describe the reason for return" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d8e2dc', borderRadius: 5, padding: '11px 12px', font: 'inherit', color: '#17211e' }} />
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handleReturn} disabled={returning} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: 6, cursor: returning ? 'not-allowed' : 'pointer' }}>
                    {returning ? 'Submitting...' : 'Submit return request'}
                  </button>
                  <button type="button" onClick={() => { setIsReturnOpen(false); setReturnReason(''); }} style={{ background: '#fff', color: '#111827', border: '1px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: 6, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
