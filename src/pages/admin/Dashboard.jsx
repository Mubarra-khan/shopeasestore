import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts } from '../../api/product.api';
import { getManagedOrders } from '../../api/order.api';
import { getCoupons } from '../../api/coupon.api';
import { getSellers } from '../../api/admin.api';
import { getAdminStats, getMonthlyAnalytics } from '../../api/admin.api';

const formatMoney = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function AdminDashboard() {
  const [data, setData] = useState({ products: [], orders: [], coupons: [], sellers: [], stats: null, analytics: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(), getManagedOrders(), getCoupons(), getSellers(), getAdminStats(), getMonthlyAnalytics()])
      .then(([productsResponse, ordersResponse, couponsResponse, sellersResponse, statsResponse, analyticsResponse]) => {
        const stats = statsResponse?.data?.data || {};
        const analytics = analyticsResponse?.data?.data || {};
        setData({
          products: productsResponse?.data?.data || [],
          orders: ordersResponse?.data?.data || [],
          coupons: couponsResponse?.data?.data || [],
          sellers: sellersResponse?.data?.data || [],
          stats,
          analytics,
        });
      })
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load dashboard data'))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  const pendingOrders = data.orders.filter((order) => order.status === 'pending').length;
  const paidOrders = data.stats?.paidOrders ?? data.orders.filter((order) => order.paymentStatus === 'paid').length;
  const activeCoupons = data.coupons.filter((coupon) => coupon.isActive).length;
  const revenue = data.stats?.revenue ?? 0;
  const currentMonth = data.analytics?.currentMonth || {};
  const monthlyTrend = data.analytics?.monthlyTrend || [];
  const maxTrendOrders = Math.max(...monthlyTrend.map((m) => m.totalOrders), 1);

  if (loading) return <div className="admin-state">Loading overview...</div>;
  if (error) return <div className="admin-state admin-error">{error}</div>;

  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Today at a glance</p><h1>Overview</h1><p className="admin-muted">A live readout of your store operations.</p></div><span className="live-dot">Live data</span></div>
    <section className="admin-stat-grid" aria-label="Store statistics">
      <article className="admin-stat-card"><span className="stat-label">Products</span><strong>{data.products.length}</strong><span className="stat-note">in catalog</span></article>
      <article className="admin-stat-card accent"><span className="stat-label">Orders</span><strong>{data.orders.length}</strong><span className="stat-note">all managed orders</span></article>
      <article className="admin-stat-card"><span className="stat-label">Pending</span><strong>{pendingOrders}</strong><span className="stat-note">awaiting fulfillment</span></article>
      <article className="admin-stat-card"><span className="stat-label">Paid orders</span><strong>{paidOrders}</strong><span className="stat-note">{formatMoney(revenue)} collected</span></article>
      <article className="admin-stat-card"><span className="stat-label">Total sellers</span><strong>{data.sellers.length}</strong><span className="stat-note">registered partners</span></article>
    </section>
    <section className="admin-two-column">
      <article className="admin-panel"><div className="panel-heading"><div><p className="admin-kicker">Order health</p><h2>Recent orders</h2></div><a href="/admin/orders" className="text-link">View all</a></div>{data.orders.length === 0 ? <p className="admin-empty">No orders have been placed yet.</p> : <div className="mini-list">{data.orders.slice(0, 5).map((order) => <div className="mini-row" key={order._id}><span><strong>#{String(order._id).slice(-8)}</strong><small>{order.items?.length || 0} items</small></span><span className={`status status-${order.status}`}>{order.status}</span><strong>{formatMoney(order.finalAmount ?? order.totalAmount)}</strong></div>)}</div>}</article>
      <article className="admin-panel admin-panel-dark"><p className="admin-kicker">Promotions</p><h2>Coupon coverage</h2><strong className="panel-number">{activeCoupons}</strong><p>active coupon{activeCoupons === 1 ? '' : 's'} available to customers</p><a href="/admin/coupons" className="dark-link">Manage coupons</a></article>
    </section>
    <section className="admin-two-column" style={{ marginTop: '1.5rem' }}>
      <article className="admin-panel">
        <div className="panel-heading"><div><p className="admin-kicker">This month</p><h2>Monthly snapshot</h2></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total orders</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.totalOrders || 0}</strong></div>
          <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Delivered</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.deliveredOrders || 0}</strong></div>
          <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Cancelled</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.cancelledOrders || 0}</strong></div>
          <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Pending / Processing</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.pendingProcessingOrders || 0}</strong></div>
          <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Eligible revenue</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{formatMoney(currentMonth.revenue || 0)}</strong></div>
        </div>
      </article>
      <article className="admin-panel">
        <div className="panel-heading"><div><p className="admin-kicker">Trend</p><h2>Monthly orders</h2></div></div>
        {monthlyTrend.length === 0 ? <p className="admin-empty">No data available.</p> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160, paddingTop: 8 }}>
            {monthlyTrend.map((point) => {
              const height = maxTrendOrders > 0 ? Math.max((point.totalOrders / maxTrendOrders) * 100, 4) : 4;
              return (
                <div key={`${point.month}-${point.year}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <strong style={{ fontSize: '0.75rem', color: '#334155' }}>{point.totalOrders}</strong>
                  <div style={{ width: '100%', height: `${height}%`, background: '#F85606', borderRadius: 4, opacity: 0.85 }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{point.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  </div>;
}