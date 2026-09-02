import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSellerDashboardStats, getSellerProducts, getSellerAnalytics } from '../../api/seller.api';

const formatMoney = (value) => `$ ${Number(value || 0).toFixed(2)}`;

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [analytics, setAnalytics] = useState({ currentMonth: {}, monthlyTrend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    Promise.all([getSellerDashboardStats(), getSellerProducts(), getSellerAnalytics()])
      .then(([statsResponse, productsResponse, analyticsResponse]) => {
        const nextStats = statsResponse?.data?.data || {};
        const productCount = productsResponse?.data?.data?.length || 0;
        setStats({
          totalProducts: Number(nextStats.totalProducts ?? productCount),
          inStockProducts: Number(nextStats.inStockProducts ?? 0),
          outOfStockProducts: Number(nextStats.outOfStockProducts ?? 0),
          totalOrders: Number(nextStats.totalOrders ?? 0),
          pendingOrders: Number(nextStats.pendingOrders ?? 0),
          processingOrders: Number(nextStats.processingOrders ?? 0),
          deliveredOrders: Number(nextStats.deliveredOrders ?? 0),
          totalRevenue: Number(nextStats.totalRevenue ?? 0),
        });
        setAnalytics(analyticsResponse?.data?.data || { currentMonth: {}, monthlyTrend: [] });
      })
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load seller dashboard'))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  const currentMonth = analytics.currentMonth || {};
  const monthlyTrend = analytics.monthlyTrend || [];
  const maxTrendOrders = Math.max(...monthlyTrend.map((m) => m.totalOrders), 1);

  if (loading) return <div className="seller-state">Loading dashboard...</div>;
  if (error) return <div className="seller-error">{error}</div>;

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Today at a glance</p>
          <h1>Seller overview</h1>
          <p className="seller-muted">Live performance across your catalog and orders.</p>
        </div>
        <span className="seller-count-label">Live data</span>
      </div>

      <section className="seller-stat-grid" aria-label="Seller statistics">
        <article className="seller-stat-card">
          <span className="stat-label">Products</span>
          <strong>{stats.totalProducts}</strong>
          <span className="stat-note">total listings</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">In stock</span>
          <strong>{stats.inStockProducts}</strong>
          <span className="stat-note">ready to sell</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">Out of stock</span>
          <strong>{stats.outOfStockProducts}</strong>
          <span className="stat-note">needs replenishment</span>
        </article>
        <article className="seller-stat-card accent">
          <span className="stat-label">Revenue</span>
          <strong>{formatMoney(stats.totalRevenue)}</strong>
          <span className="stat-note">seller revenue</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">Orders</span>
          <strong>{stats.totalOrders}</strong>
          <span className="stat-note">all seller orders</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">Pending</span>
          <strong>{stats.pendingOrders}</strong>
          <span className="stat-note">awaiting action</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">Processing</span>
          <strong>{stats.processingOrders}</strong>
          <span className="stat-note">in fulfillment</span>
        </article>
        <article className="seller-stat-card">
          <span className="stat-label">Delivered</span>
          <strong>{stats.deliveredOrders}</strong>
          <span className="stat-note">completed sales</span>
        </article>
      </section>

      <section style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
        <article className="seller-panel">
          <div className="panel-heading"><div><p className="seller-kicker">This month</p><h2>Monthly snapshot</h2></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total orders</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.totalOrders || 0}</strong></div>
            <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Delivered</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.deliveredOrders || 0}</strong></div>
            <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Cancelled</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{currentMonth.cancelledOrders || 0}</strong></div>
            <div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>Revenue</span><strong style={{ display: 'block', fontSize: '1.25rem' }}>{formatMoney(currentMonth.revenue || 0)}</strong></div>
          </div>
        </article>
        <article className="seller-panel">
          <div className="panel-heading"><div><p className="seller-kicker">Trend</p><h2>Monthly orders</h2></div></div>
          {monthlyTrend.length === 0 ? <p className="seller-empty">No data available.</p> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160, paddingTop: 8 }}>
              {monthlyTrend.map((point) => {
                const height = maxTrendOrders > 0 ? Math.max((point.totalOrders / maxTrendOrders) * 100, 4) : 4;
                return (
                  <div key={`${point.month}-${point.year}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <strong style={{ fontSize: '0.75rem', color: '#334155' }}>{point.totalOrders}</strong>
                    <div style={{ width: '100%', height: `${height}%`, background: '#111827', borderRadius: 4, opacity: 0.85 }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{point.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
