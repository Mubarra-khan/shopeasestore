import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSellerApplication } from '../../api/sellerApplication.api';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  businessName: '',
  category: '',
  businessDescription: '',
  businessAddress: '',
  website: '',
};

export default function BecomeSeller() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitSellerApplication(form);
      navigate('/my-seller-application', { state: { submitted: true } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Become a Seller</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Submit your business details and our team will review your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Full name
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Phone
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Business name
            <input name="businessName" type="text" value={form.businessName} onChange={handleChange} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Category
            <input name="category" type="text" value={form.category} onChange={handleChange} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Website <span style={{ fontWeight: 400, color: '#6b7280' }}>(optional)</span>
            <input name="website" type="url" value={form.website} onChange={handleChange} />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
          Business description
          <textarea name="businessDescription" value={form.businessDescription} onChange={handleChange} rows={4} required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
          Business address
          <textarea name="businessAddress" value={form.businessAddress} onChange={handleChange} rows={2} required />
        </label>

        {error ? <p style={{ color: 'crimson', margin: 0 }}>{error}</p> : null}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} style={{ background: '#111827', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', fontWeight: 700 }}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button type="button" onClick={() => navigate(-1)} style={{ background: '#fff', color: '#111827', padding: '0.75rem 1.5rem', borderRadius: 10, border: '1px solid #cbd5e1', fontWeight: 700 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
