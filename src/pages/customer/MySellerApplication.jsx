import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMySellerApplication } from '../../api/sellerApplication.api';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  pending: { background: '#fff3d6', color: '#7d5b00' },
  approved: { background: '#dff6e8', color: '#1c6f4c' },
  rejected: { background: '#fee4df', color: '#9a2a22' },
};

export default function MySellerApplication() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const response = await getMySellerApplication();
        setApplication(response?.data?.data || null);
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.error(err?.response?.data?.message || 'Unable to load application');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, []);

  const submitted = location.state?.submitted;

  if (loading) return <div style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem' }}>Loading application...</div>;

  if (!application && !submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2>No application found</h2>
        <p style={{ color: '#64748b' }}>You have not submitted a seller application yet.</p>
        <Link to="/become-seller" style={{ display: 'inline-block', marginTop: '1rem', background: '#111827', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
          Become a Seller
        </Link>
      </div>
    );
  }

  const style = statusStyles[application?.status] || statusStyles.pending;

  return (
    <div style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem' }}>
      {submitted && !application && (
        <div style={{ background: '#e8f5df', color: '#35652d', border: '1px solid #c9e5bb', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
          Your application has been submitted successfully. Our team will review it shortly.
        </div>
      )}

      {application && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem' }}>Seller Application</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Submitted on {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 36, borderRadius: 999, padding: '0 14px', background: style.background, color: style.color, fontWeight: 700, fontSize: '0.875rem', textTransform: 'capitalize' }}>
              {application.status}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Full name</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.name}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Email</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.email}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Phone</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.phone}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business name</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.businessName}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Category</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.category}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Website</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{application.website || '—'}</p>
              </div>
            </div>

            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business description</p>
              <p style={{ margin: 0 }}>{application.businessDescription}</p>
            </div>

            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business address</p>
              <p style={{ margin: 0 }}>{application.businessAddress}</p>
            </div>

            {application.rejectionReason && (
              <div style={{ background: '#fef3f2', border: '1px solid #f7c6c2', borderRadius: 8, padding: '1rem' }}>
                <p style={{ color: '#9a2a22', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Rejection reason</p>
                <p style={{ margin: 0, color: '#9a2a22' }}>{application.rejectionReason}</p>
              </div>
            )}

            {application.status === 'approved' && (
              <div style={{ background: '#e8f5df', border: '1px solid #c9e5bb', borderRadius: 8, padding: '1.25rem' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#35652d', fontWeight: 700, fontSize: '1.05rem' }}>Application approved</p>
                <p style={{ margin: '0 0 0.75rem', color: '#35652d' }}>Your seller account is now active.</p>
                {user?.role === 'seller' ? (
                  <Link to="/seller" style={{ display: 'inline-block', background: '#111827', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
                    Go to Seller Dashboard
                  </Link>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.75rem', color: '#35652d' }}>Please log out and log in again to access your seller dashboard with your updated account role.</p>
                    <button type="button" onClick={logout} style={{ background: '#111827', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
                      Log out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
