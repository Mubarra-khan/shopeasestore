import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getManagedCancelledOrders } from '../../api/order.api';

const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function SellerCancellations() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCancellations = async () => {
    setLoading(true);
    try {
      const response = await getManagedCancelledOrders();
      setCancellations(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load cancellations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCancellations();
  }, []);

  if (loading) return <div className="seller-state">Loading cancellations...</div>;

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Customer Experience</p>
          <h1>Cancellations</h1>
          <p className="seller-muted">Cancelled orders containing your products.</p>
        </div>
        <span className="seller-count-label">{cancellations.length} cancellations</span>
      </div>

      {error ? <div className="seller-error" style={{ marginBottom: 18 }}>{error}</div> : null}

      <section className="seller-panel table-panel">
        {cancellations.length === 0 ? (
          <p className="seller-empty">No cancelled orders contain your products yet.</p>
        ) : (
          <div className="seller-table-wrap">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{String(order._id).slice(-8)}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {order.paymentMethod === 'cod' ? 'COD' : 'Stripe'}
                      </div>
                    </td>
                    <td>{order.user?.name || order.user?.email || order.user || 'Customer'}</td>
                    <td>
                      {order.items?.map((item, index) => (
                        <div key={`${order._id}-${index}`}>
                          <strong>{item.productName}</strong>
                          <div>Qty {item.quantity} · {money(item.price)} each</div>
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong>{money(order.sellerRevenue ?? order.totalAmount ?? 0)}</strong>
                      <div>{order.items?.length || 0} item(s)</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
