import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/seller.css';

export default function SellerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="seller-shell">
      <aside className="seller-sidebar">
        <Link to="/seller" className="seller-brand">
          <span className="seller-brand-mark">S</span>
          <span>ShopEase <small>seller center</small></span>
        </Link>

        <nav className="seller-nav" aria-label="Seller navigation">
          <NavLink to="/seller" end>Dashboard</NavLink>
          <NavLink to="/seller/products">My Products</NavLink>
          <NavLink to="/seller/orders">My Orders</NavLink>
          <NavLink to="/seller/returns">Returns</NavLink>
          <NavLink to="/seller/cancellations">Cancellations</NavLink>
          <NavLink to="/seller/messages">Messages</NavLink>
          <NavLink to="/seller/coupons">My Coupons</NavLink>
          <NavLink to="/seller/profile">Profile</NavLink>
        </nav>

        <div className="seller-sidebar-foot">
          <span className="seller-role">SELLER ACCESS</span>
          <button type="button" className="seller-logout" onClick={logout}>Logout</button>
          <Link to="/" className="seller-store-link">Back to storefront</Link>
        </div>
      </aside>

      <div className="seller-content">
        <header className="seller-topbar">
          <div>
            <p className="seller-kicker">Operations</p>
            <p className="seller-page-context">Seller management</p>
          </div>
          <div className="seller-account">
            <span className="seller-avatar">{(user?.name || user?.email || 'S').charAt(0).toUpperCase()}</span>
            <span>{user?.name || user?.email}</span>
            <button type="button" className="seller-logout" onClick={logout}>Log out</button>
          </div>
        </header>

        <main className="seller-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
