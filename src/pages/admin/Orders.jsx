import { useEffect, useState } from 'react';
import { getManagedOrders, updateOrderStatus, markOrderAsPaid } from '../../api/order.api';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function AdminOrders() {
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
      setError(err?.response?.data?.message || 'Unable to load orders');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatus(orderId, status);
      const updated = response?.data?.data;
      setOrders((current) => current.map((order) => order._id === orderId ? (updated || { ...order, status }) : order));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update order status');
    } finally { setUpdatingId(null); }
  };

  const markAsPaid = async (orderId) => {
    setMarkingPaidId(orderId);
    try {
      const response = await markOrderAsPaid(orderId);
      const updated = response?.data?.data;
      setOrders((current) => current.map((order) => order._id === orderId ? (updated || { ...order, paymentStatus: 'paid' }) : order));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark order as paid');
    } finally {
      setMarkingPaidId(null);
      window.location.reload();
    }
  };

  if (loading) return <div className="admin-state">Loading orders...</div>;

  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Fulfillment</p><h1>Orders</h1><p className="admin-muted">Review every order and move it through its real fulfillment states.</p></div><span className="admin-count-label">{orders.length} total</span></div>
    {error ? <div className="admin-error admin-inline-error">{error}</div> : null}
    <section className="admin-panel table-panel">
      {orders.length === 0 ? <p className="admin-empty">No orders are available to manage.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Seller / Items</th><th>Amounts</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}>
        <td><strong>#{String(order._id).slice(-8)}</strong><small>{order._id}</small></td>
        <td>{order.user?.name || order.user?.email || order.user || 'Customer'}</td>
        <td>
          <div className="item-stack">{order.items?.map((item, index) => <span key={`${order._id}-${index}`}>{item.productName} <b>x{item.quantity}</b></span>)}</div>
          {order.shippingAddress ? <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Ships to {order.shippingAddress.city}, {order.shippingAddress.state}</div> : null}
        </td>
        <td><strong>{money(order.finalAmount ?? order.totalAmount)}</strong><small>Subtotal {money(order.totalAmount)}{order.discountAmount ? ` · -${money(order.discountAmount)}` : ''}</small></td>
        <td><span className={`status status-${order.paymentStatus}`}>{order.paymentStatus}</span><small>{order.paymentMethod === 'cod' ? 'COD' : 'Stripe'}</small></td>
        <td>
          {order.status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid' ? (
            <button type="button" disabled={markingPaidId === order._id} onClick={() => markAsPaid(order._id)} style={{ background: '#F85606', color: '#fff', border: 'none', borderRadius: 6, padding: '0.35rem 0.75rem', cursor: markingPaidId === order._id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              {markingPaidId === order._id ? 'Saving...' : 'Mark as Paid'}
            </button>
          ) : (
            <select className="status-select" value={order.status} disabled={updatingId === order._id} onChange={(event) => changeStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          )}
        </td>
        <td><small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</small></td>
      </tr>)}</tbody></table></div>}
    </section>
  </div>;
}
