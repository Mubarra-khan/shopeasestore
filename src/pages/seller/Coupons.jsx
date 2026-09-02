import { useEffect, useState } from 'react';
import { getSellerCoupons, createSellerCoupon } from '../../api/seller.api';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '0',
  maximumDiscountAmount: '',
  expiresAt: '',
  usageLimit: '100',
};

const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

const statusBadge = (coupon) => {
  const now = new Date();
  const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
  if (!coupon.isActive) return { label: 'Disabled', className: 'status status-cancelled' };
  if (expiresAt && expiresAt < now) return { label: 'Expired', className: 'status status-cancelled' };
  return { label: 'Active', className: 'status status-delivered' };
};

export default function SellerCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await getSellerCoupons();
      setCoupons(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minimumOrderAmount: Number(form.minimumOrderAmount || 0),
      maximumDiscountAmount: form.maximumDiscountAmount === '' ? null : Number(form.maximumDiscountAmount),
      expiresAt: new Date(form.expiresAt).toISOString(),
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    };
    try {
      await createSellerCoupon(payload);
      setForm(emptyForm);
      await loadCoupons();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setError('Unable to copy code');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { deleteCoupon } = await import('../../api/coupon.api');
      await deleteCoupon(deleteId);
      setDeleteId(null);
      await loadCoupons();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete coupon');
    }
  };

  if (loading) return <div className="seller-state">Loading coupons...</div>;
  return <div className="seller-page">
    <div className="seller-page-heading">
      <div>
        <p className="seller-kicker">Promotions</p>
        <h1>My Coupons</h1>
        <p className="seller-muted">Create and manage discount offers for your products.</p>
      </div>
    </div>
    {error ? <div className="seller-error" style={{ marginBottom: 18 }}>{error}</div> : null}
    <section className="seller-panel coupon-form-panel">
      <div className="panel-heading">
        <div>
          <p className="seller-kicker">New offer</p>
          <h2>Create coupon</h2>
        </div>
      </div>
      <form className="seller-form" onSubmit={submit}>
        <div className="seller-form-grid">
          <label>Coupon code<input name="code" value={form.code} onChange={change} required /></label>
          <label>Discount type<select name="discountType" value={form.discountType} onChange={change}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
          <label>Discount value<input name="discountValue" type="number" min="0.01" step="0.01" value={form.discountValue} onChange={change} required /></label>
        </div>
        <div className="seller-form-grid" style={{ marginTop: '1rem' }}>
          <label>Minimum order<input name="minimumOrderAmount" type="number" min="0" step="0.01" value={form.minimumOrderAmount} onChange={change} /></label>
          <label>Maximum discount<input name="maximumDiscountAmount" type="number" min="0" step="0.01" placeholder="No cap" value={form.maximumDiscountAmount} onChange={change} /></label>
          <label>Expiry date<input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={change} required /></label>
          <label>Usage limit<input name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={change} placeholder="Unlimited" /></label>
        </div>
        <div className="seller-action-row">
          <button type="submit" className="seller-button" disabled={saving}>{saving ? 'Saving...' : 'Create coupon'}</button>
        </div>
      </form>
    </section>
    <section className="seller-panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="seller-kicker">Live register</p>
          <h2>Your coupons</h2>
        </div>
      </div>
      {coupons.length === 0 ? <p className="seller-empty">No coupons created yet.</p> : (
        <div className="seller-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="seller-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Rules</th>
                <th>Expiry</th>
                <th>Usage</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const badge = statusBadge(coupon);
                return (
                  <tr key={coupon._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{coupon.code}</strong>
                        <button type="button" onClick={() => copyCode(coupon)} style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          {copiedId === coupon._id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <small style={{ color: '#6b7280' }}>{coupon._id}</small>
                    </td>
                    <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : money(coupon.discountValue)}</td>
                    <td>
                      <small>Min {money(coupon.minimumOrderAmount)}{coupon.maximumDiscountAmount != null ? ` · Cap ${money(coupon.maximumDiscountAmount)}` : ''}</small>
                    </td>
                    <td><small>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}</small></td>
                    <td><small>{coupon.usedCount} / {coupon.usageLimit ?? '∞'}</small></td>
                    <td><span className={badge.className}>{badge.label}</span></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="danger-button" onClick={() => setDeleteId(coupon._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>

    {deleteId ? (
      <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
        <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-coupon-title">
          <div className="panel-heading">
            <div>
              <p className="seller-kicker">Confirm</p>
              <h2 id="delete-coupon-title">Delete coupon</h2>
            </div>
            <button type="button" className="button-quiet" onClick={() => setDeleteId(null)}>Close</button>
          </div>
          <p style={{ margin: '1rem 0' }}>Are you sure you want to delete this coupon? This action cannot be undone.</p>
          <div className="modal-actions">
            <button type="button" className="button-quiet" onClick={() => setDeleteId(null)}>Cancel</button>
            <button type="button" className="button-primary" disabled={saving} style={{ background: '#9a2a22' }} onClick={confirmDelete}>{saving ? 'Deleting...' : 'Delete coupon'}</button>
          </div>
        </section>
      </div>
    ) : null}
  </div>;
}
