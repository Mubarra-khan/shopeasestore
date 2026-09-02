import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand"><span className="admin-brand-mark">S</span><span>ShopEase <small>control center</small></span></Link>
         <nav className="admin-nav" aria-label="Admin navigation">
            <NavLink to="/admin" end>Overview</NavLink><NavLink to="/admin/products">Catalog</NavLink><NavLink to="/admin/categories">Categories</NavLink><NavLink to="/admin/orders">Orders</NavLink><NavLink to="/admin/returns">Returns</NavLink><NavLink to="/admin/messages">Messages</NavLink><NavLink to="/admin/coupons">Coupons</NavLink><NavLink to="/admin/sellers">Sellers</NavLink><NavLink to="/admin/banners">Banners</NavLink>
          </nav>
        <div className="admin-sidebar-foot"><span className="admin-role">ADMIN ACCESS</span><Link to="/" className="admin-store-link">Back to storefront</Link></div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar"><div><p className="admin-kicker">Operations</p><p className="admin-page-context">Store management</p></div><div className="admin-account"><span className="admin-avatar">{(user?.name || user?.email || 'A').charAt(0).toUpperCase()}</span><span>{user?.name || user?.email}</span><button type="button" className="admin-logout" onClick={logout}>Log out</button></div></header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
