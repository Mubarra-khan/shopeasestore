import { useEffect, useState } from 'react';
import { createCoupon, deleteCoupon, getCoupons, toggleCoupon, updateCoupon } from '../../api/coupon.api';

const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minimumOrderAmount: '0', maximumDiscountAmount: '', expiresAt: '', usageLimit: '100' };
const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = async () => {
    setLoading(true);
    try { const response = await getCoupons(); setCoupons(response?.data?.data || []); setError(''); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to load coupons'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadCoupons(); }, []);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { code: form.code, discountType: form.discountType, discountValue: Number(form.discountValue), minimumOrderAmount: Number(form.minimumOrderAmount || 0), maximumDiscountAmount: form.maximumDiscountAmount === '' ? null : Number(form.maximumDiscountAmount), expiresAt: new Date(form.expiresAt).toISOString(), usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit) };
    try {
      if (editingId) await updateCoupon(editingId, payload); else await createCoupon(payload);
      setForm(emptyForm); setEditingId(null); await loadCoupons();
    } catch (err) { setError(err?.response?.data?.message || 'Unable to save coupon'); }
    finally { setSaving(false); }
  };
  const edit = (coupon) => setForm({ code: coupon.code, discountType: coupon.discountType, discountValue: String(coupon.discountValue), minimumOrderAmount: String(coupon.minimumOrderAmount ?? 0), maximumDiscountAmount: coupon.maximumDiscountAmount == null ? '' : String(coupon.maximumDiscountAmount), expiresAt: dateValue(coupon.expiresAt), usageLimit: coupon.usageLimit == null ? '' : String(coupon.usageLimit) });
  const remove = async (coupon) => { if (!window.confirm(`Delete ${coupon.code}?`)) return; try { await deleteCoupon(coupon._id); await loadCoupons(); } catch (err) { setError(err?.response?.data?.message || 'Unable to delete coupon'); } };
  const toggle = async (coupon) => { try { await toggleCoupon(coupon._id); await loadCoupons(); } catch (err) { setError(err?.response?.data?.message || 'Unable to update coupon'); } };

  if (loading) return <div className="admin-state">Loading coupons...</div>;
  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Promotions</p><h1>Coupons</h1><p className="admin-muted">Create and maintain customer offers from the backend.</p></div><span className="admin-count-label">{coupons.length} total</span></div>
    {error ? <div className="admin-error admin-inline-error">{error}</div> : null}
    <section className="admin-panel coupon-form-panel"><div className="panel-heading"><div><p className="admin-kicker">{editingId ? 'Edit offer' : 'New offer'}</p><h2>{editingId ? 'Update coupon' : 'Create coupon'}</h2></div>{editingId ? <button type="button" className="button-quiet" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button> : null}</div><form className="coupon-form" onSubmit={submit}><label>Code<input name="code" value={form.code} onChange={change} required /></label><label>Type<select name="discountType" value={form.discountType} onChange={change}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label><label>Value<input name="discountValue" type="number" min="0.01" step="0.01" value={form.discountValue} onChange={change} required /></label><label>Minimum order<input name="minimumOrderAmount" type="number" min="0" step="0.01" value={form.minimumOrderAmount} onChange={change} required /></label><label>Maximum discount<input name="maximumDiscountAmount" type="number" min="0" step="0.01" placeholder="No cap" value={form.maximumDiscountAmount} onChange={change} /></label><label>Expires<input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={change} required /></label><label>Usage limit<input name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={change} placeholder="Unlimited" /></label><button type="submit" className="button-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create coupon'}</button></form></section>
    <section className="admin-panel table-panel"><div className="panel-heading"><div><p className="admin-kicker">Live register</p><h2>All coupons</h2></div></div>{coupons.length === 0 ? <p className="admin-empty">No coupons created yet.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Code</th><th>Discount</th><th>Rules</th><th>Expiry</th><th>Usage</th><th>State</th><th>Actions</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon._id}><td><strong>{coupon.code}</strong><small>{coupon._id}</small></td><td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : money(coupon.discountValue)}</td><td><small>Min {money(coupon.minimumOrderAmount)}{coupon.maximumDiscountAmount != null ? ` · Cap ${money(coupon.maximumDiscountAmount)}` : ''}</small></td><td><small>{new Date(coupon.expiresAt).toLocaleDateString()}</small></td><td><small>{coupon.usedCount} / {coupon.usageLimit ?? '∞'}</small></td><td><span className={`status ${coupon.isActive ? 'status-delivered' : 'status-cancelled'}`}>{coupon.isActive ? 'active' : 'inactive'}</span></td><td><div className="row-actions"><button type="button" onClick={() => { setEditingId(coupon._id); edit(coupon); }}>Edit</button><button type="button" onClick={() => toggle(coupon)}>{coupon.isActive ? 'Deactivate' : 'Activate'}</button><button type="button" className="danger-button" onClick={() => remove(coupon)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
