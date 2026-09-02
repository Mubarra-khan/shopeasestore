import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getMySellerApplication } from '../api/sellerApplication.api';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notification.api';
import { useEffect, useState, useRef } from 'react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [_applicationStatus, setApplicationStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  const accountRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const checkApplication = async () => {
      if (!user?._id) return;
      try {
        const response = await getMySellerApplication();
        const app = response?.data?.data || response?.data;
        if (app?._id) {
          setApplicationStatus(app.status);
        } else {
          setApplicationStatus('none');
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setApplicationStatus('none');
        }
      }
    };

    checkApplication();
  }, [user?._id]);

  const fetchNotifications = async () => {
    if (!user?._id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getNotifications();
      const data = response?.data?.data || {};
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      // notifications are optional
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?._id]);

  useEffect(() => {
    const handleNotificationChange = () => {
      fetchNotifications();
    };

    window.addEventListener('notifications:changed', handleNotificationChange);
    return () => window.removeEventListener('notifications:changed', handleNotificationChange);
  }, [user?._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((current) => current.map((n) => n._id === notification._id ? { ...n, isRead: true } : n));
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // ignore read errors
      }
    }

    setNotificationsOpen(false);
    if (notification.link) {
      const state = notification.type === 'review_prompt'
        ? { showReviewForm: true, orderId: notification.order || null, orderItemId: notification.orderItem || null, notificationId: notification._id || null }
        : {};
      navigate(notification.link, { state });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: '#F85606', color: '#fff', fontSize: '0.8rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.4rem 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <Link to="/become-seller" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem' }}>Sell on ShopEase</Link>
          <Link to="/support" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem' }}>Help & Support</Link>
          <Link to="/orders" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem' }}>Track Order</Link>
          {user ? (
            <div style={{ position: 'relative' }} ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {user.email}▾
              </button>
              {accountOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 9999, overflow: 'hidden' }}>
                  <div style={{ padding: '0.5rem 0' }}>
                    <button type="button" onClick={() => { navigate('/account'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Manage My Account
                    </button>
                    <button type="button" onClick={() => { navigate('/orders'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      My Orders
                    </button>
                    <button type="button" onClick={() => { navigate('/wishlist'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      My Wishlist & Followed Stores
                    </button>
                    <button type="button" onClick={() => { navigate('/reviews'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      My Reviews
                    </button>
                    <button type="button" onClick={() => { navigate('/returns'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      My Returns & Cancellations
                    </button>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
                    <button type="button" onClick={() => { navigate('/become-seller'); setAccountOpen(false); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Sell on ShopEase
                    </button>
                    <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Login</Link>
              <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      <header style={{ background: '#F85606', color: '#fff', position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'block' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <div style={{ width: 160, height: 48, overflow: 'hidden', display: 'inline-flex', alignItems: 'center' }}>
              <img src="/shopease-logo.png" alt="ShopEase" style={{ height: 104, width: 'auto', display: 'block' }} />
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <form onSubmit={handleSearch} style={{ flex: 'none', minWidth: 240, display: 'flex', maxWidth: 714, width: 714, marginLeft: 66 }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and categories"
                style={{ flex: 1, padding: '0.55rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRight: 'none', borderRadius: 0, outline: 'none', fontSize: '0.95rem' }}
              />
              <div style={{ width: 1, background: '#e5e7eb' }} />
              <button type="submit" style={{ padding: '0.55rem 0.55rem', border: '1px solid #e5e7eb', borderLeft: 'none', background: '#fff', color: '#f97316', borderRadius: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/cart" style={{ position: 'relative', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -8, right: -10, background: '#fff', color: '#f97316', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <div ref={notificationRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -8, background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: 999, minWidth: 16, textAlign: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: 320, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 9999, overflow: 'hidden', maxHeight: 360, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.5rem 0', overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>No notifications yet.</p>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#111827', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid #f1f5f9' }}
                          >
                            <span style={{ fontWeight: 600 }}>{notification.title}</span>
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{notification.message}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{new Date(notification.createdAt).toLocaleDateString()}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {user?.role === 'seller' ? (
                <Link to="/seller" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>Seller Dashboard</Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 200px)', background: '#f8fafc' }}>
        <Outlet />
      </main>

      <footer style={{ background: '#0f172a', color: '#94a3b8', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Customer Service</h4>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <Link to="/support" style={{ color: '#94a3b8' }}>Help Center</Link>
              <Link to="/support" style={{ color: '#94a3b8' }}>Contact Us</Link>
              <Link to="/orders" style={{ color: '#94a3b8' }}>Returns & Refunds</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Shopping</h4>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <Link to="/products" style={{ color: '#94a3b8' }}>All Categories</Link>
              <Link to="/orders" style={{ color: '#94a3b8' }}>My Orders</Link>
              <Link to="/cart" style={{ color: '#94a3b8' }}>Shopping Cart</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Marketplace</h4>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <Link to="/become-seller" style={{ color: '#94a3b8' }}>Become a Seller</Link>
              <Link to="/support" style={{ color: '#94a3b8' }}>Seller Support</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Company</h4>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <Link to="/support" style={{ color: '#94a3b8' }}>About ShopEase</Link>
              <Link to="/support" style={{ color: '#94a3b8' }}>Contact</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
            <span>© 2026 ShopEase. All rights reserved.</span>
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
