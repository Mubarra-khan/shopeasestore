import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth.api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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
            onClick={() => setShowPassword(!showPassword)}
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
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {error ? <p style={{ color: 'crimson', margin: 0 }}>{error}</p> : null}
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
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
