import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/auth.api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token: form.token, password: form.password });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="token" type="text" placeholder="Reset Token" value={form.token} onChange={handleChange} required />
        <input name="password" type="password" placeholder="New Password" value={form.password} onChange={handleChange} required minLength={8} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required minLength={8} />
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        {success ? <p style={{ color: 'green' }}>{success}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
