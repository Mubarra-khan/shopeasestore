import { useEffect, useState } from 'react';
import { getProfile } from '../../api/auth.api';

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProfile();
        const data = response?.data?.data || response?.data;
        setProfile(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', color: 'crimson' }}>{error}</div>;
  }

  if (!profile) {
    return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', color: '#64748b' }}>No profile data found.</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Manage My Account</h1>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Name</label>
          <div style={{ fontSize: '1rem', color: '#111827' }}>{profile.name || '-'}</div>
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Email</label>
          <div style={{ fontSize: '1rem', color: '#111827' }}>{profile.email || '-'}</div>
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Role</label>
          <div style={{ fontSize: '1rem', color: '#111827', textTransform: 'capitalize' }}>{profile.role || '-'}</div>
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Account Status</label>
          <div style={{ fontSize: '1rem', color: profile.isActive === false ? '#dc2626' : '#16a34a' }}>{profile.isActive === false ? 'Inactive' : 'Active'}</div>
        </div>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Member Since</label>
          <div style={{ fontSize: '1rem', color: '#111827' }}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</div>
        </div>
      </div>
    </div>
  );
}
