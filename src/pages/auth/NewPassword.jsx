import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../api/auth.api';

function PasswordInput({ label, value, onChange, show, onToggle, name }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          minLength={8}
          style={{
            width: '100%',
            padding: '0.75rem',
            paddingRight: '3rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

export default function NewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSessionToken = location.state?.resetSessionToken || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({ resetSessionToken, password });
      if (response.data?.success) {
        setSuccess('Your password has been updated successfully!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>Set New Password</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Your new password must be different from previously used passwords.
      </p>

      {success ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: 'green', marginBottom: '1rem', fontSize: '1.125rem' }}>{success}</p>
          <Link
            to="/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="New Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {error ? <p style={{ color: 'crimson', margin: '0 0 1rem' }}>{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
