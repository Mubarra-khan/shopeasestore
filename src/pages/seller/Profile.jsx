import { useAuth } from '../../context/AuthContext';

export default function SellerProfile() {
  const { user } = useAuth();

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Account</p>
          <h1>Profile</h1>
          <p className="seller-muted">Manage your seller account details.</p>
        </div>
      </div>

      <section className="seller-page-card seller-profile-grid">
        <div className="seller-profile-card">
          <p className="seller-kicker">Name</p>
          <h2>{user?.name || 'Seller'}</h2>
        </div>
        <div className="seller-profile-card">
          <p className="seller-kicker">Email</p>
          <h2>{user?.email || 'Unavailable'}</h2>
        </div>
        <div className="seller-profile-card">
          <p className="seller-kicker">Role</p>
          <h2>{user?.role || 'seller'}</h2>
        </div>
        <div className="seller-profile-card">
          <p className="seller-kicker">Account status</p>
          <h2>Active</h2>
        </div>
      </section>
    </div>
  );
}
