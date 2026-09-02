import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await forgotPassword({ email });
      if (response.data?.success) {
        setSuccess('If an account exists with that email, a verification code has been sent.');
        setTimeout(() => {
          navigate('/verify-code', { state: { email } });
        }, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>Forgot Password</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Enter your email and we'll send you a verification code to reset your password.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        {error ? <p style={{ color: 'crimson', margin: 0 }}>{error}</p> : null}
        {success ? <p style={{ color: 'green', margin: 0 }}>{success}</p> : null}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
