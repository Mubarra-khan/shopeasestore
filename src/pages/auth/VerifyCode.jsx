import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { forgotPassword, verifyResetCode } from '../../api/auth.api';

function OtpInput({ value, onChange, error }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => {
            const newValue = [...value];
            newValue[index] = e.target.value;
            onChange(newValue.join(''));
            if (e.target.value && index < 5) {
              e.target.nextElementSibling?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[index] && index > 0) {
              e.target.previousElementSibling?.focus();
            }
          }}
          style={{
            width: '3rem',
            height: '3.5rem',
            textAlign: 'center',
            fontSize: '1.5rem',
            border: error ? '2px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: 8,
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const [email] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyResetCode({ email, code });
      if (response.data?.success) {
        setSuccess('Verification successful! Redirecting...');
        setTimeout(() => {
          navigate('/reset-password', { state: { email, resetSessionToken: response.data.resetSessionToken } });
        }, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError('');
    setCode('');

    try {
      const response = await forgotPassword({ email });
      if (response.data?.success) {
        setSuccess('New verification code sent');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend code');
    }
  };

  const maskEmail = (email) => {
    if (!email || email.length < 6) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}${'*'.repeat(localPart.length - 1)}@${domain}`;
    }
    return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>Check your email</h2>
      <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
        We sent a verification code to
      </p>
      <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
        {maskEmail(email)}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <OtpInput value={code} onChange={setCode} error={!!error} />
          {error ? <p style={{ color: 'crimson', margin: '0.5rem 0 0', textAlign: 'center' }}>{error}</p> : null}
          {success ? <p style={{ color: 'green', margin: '0.5rem 0 0', textAlign: 'center' }}>{success}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading || code.length !== 6 ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{
            background: 'none',
            border: 'none',
            color: resendCooldown > 0 ? '#9ca3af' : '#2563eb',
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
          }}
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Change email
        </button>
      </div>
    </div>
  );
}
