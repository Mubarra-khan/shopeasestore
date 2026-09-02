import { useEffect, useState } from 'react';
import { getManagedOrders, updateOrderStatus, markOrderAsPaid } from '../../api/order.api';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getManagedOrders();
      setOrders(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatus(orderId, nextStatus);
      const updatedOrder = response?.data?.data;
      setOrders((current) => current.map((order) => (order._id === orderId ? { ...order, status: updatedOrder?.status || nextStatus } : order)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const markAsPaid = async (orderId) => {
    setMarkingPaidId(orderId);
    try {
      const response = await markOrderAsPaid(orderId);
      const updatedOrder = response?.data?.data;
      setOrders((current) => current.map((order) => (order._id === orderId ? { ...order, paymentStatus: updatedOrder?.paymentStatus || 'paid' } : order)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark order as paid');
    } finally {
      setMarkingPaidId(null);
      window.location.reload();
    }
  };

  if (loading) return <div className="seller-state">Loading orders...</div>;

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Fulfillment</p>
          <h1>My Orders</h1>
          <p className="seller-muted">Only orders containing your products are shown here.</p>
        </div>
        <span className="seller-count-label">{orders.length} orders</span>
      </div>

      {error ? <div className="seller-error" style={{ marginBottom: 18 }}>{error}</div> : null}

      <section className="seller-panel table-panel">
        {orders.length === 0 ? (
          <p className="seller-empty">No orders contain your products yet.</p>
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
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{String(order._id).slice(-8)}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.paymentMethod === 'cod' ? 'COD' : 'Stripe'}</div>
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
                    <td><span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                    <td>
                      {order.status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid' ? (
                        <button type="button" disabled={markingPaidId === order._id} onClick={() => markAsPaid(order._id)} style={{ background: '#F85606', color: '#fff', border: 'none', borderRadius: 6, padding: '0.35rem 0.75rem', cursor: markingPaidId === order._id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          {markingPaidId === order._id ? 'Saving...' : 'Mark as Paid'}
                        </button>
                      ) : (
                        <select value={order.status} disabled={updatingId === order._id} onChange={(event) => changeStatus(order._id, event.target.value)}>
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}
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
