import { useEffect, useState } from 'react';
import { createSeller, deactivateSeller, activateSeller, deleteSeller, getSellerDetails, getSellers } from '../../api/admin.api';
import { approveSellerApplication, getSellerApplications, rejectSellerApplication } from '../../api/sellerApplication.api';

const emptyForm = { name: '', email: '', password: '', confirmPassword: '' };

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminSellers() {
  const [applications, setApplications] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [view, setView] = useState('applications');
  const [form, setForm] = useState(emptyForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [viewingSellerId, setViewingSellerId] = useState(null);

  const loadApplications = async (status) => {
    setLoading(true);
    try {
      const response = await getSellerApplications(status === 'all' ? undefined : status);
      setApplications(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load applications');
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await getSellers();
      const data = response?.data?.data || [];
      const enriched = await Promise.all(data.map(async (seller) => {
        try {
          const detailRes = await getSellerDetails(seller._id);
          const detail = detailRes?.data?.data || {};
          return { ...seller, productCount: detail.productCount ?? 0, orderCount: detail.orderCount ?? 0, couponCount: detail.couponCount ?? 0 };
        } catch {
          return { ...seller, productCount: 0, orderCount: 0, couponCount: 0 };
        }
      }));
      setSellers(enriched);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'applications') {
      loadApplications(activeTab);
    } else {
      loadSellers();
    }
  }, [view, activeTab]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const closeCreate = () => { setIsCreateOpen(false); setForm(emptyForm); setError(''); };

  const submitCreate = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (form.name.trim().length < 2) return setError('Full name must be at least 2 characters');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords must match');
    setSaving(true);
    try {
      await createSeller({ name: form.name, email: form.email, password: form.password });
      closeCreate();
      setMessage('Seller account created successfully.');
      if (view === 'sellers') loadSellers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create seller');
    } finally { setSaving(false); }
  };

  const handleApprove = async (applicationId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await approveSellerApplication(applicationId);
      setMessage('Application approved successfully.');
      await loadApplications(activeTab);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to approve application');
    } finally {
      setSaving(false);
      setRejectingId(null);
    }
  };

  const handleReject = async (applicationId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await rejectSellerApplication(applicationId, rejectionReason || null);
      setMessage('Application rejected successfully.');
      setRejectionReason('');
      setRejectingId(null);
      await loadApplications(activeTab);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reject application');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (sellerId) => {
    setSaving(true);
    setError('');
    try {
      await deactivateSeller(sellerId);
      setMessage('Seller deactivated successfully.');
      await loadSellers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to deactivate seller');
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  const handleActivate = async (sellerId) => {
    setSaving(true);
    setError('');
    try {
      await activateSeller(sellerId);
      setMessage('Seller activated successfully.');
      await loadSellers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to activate seller');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmAction?.id) return;
    setSaving(true);
    setError('');
    try {
      await deleteSeller(confirmAction.id);
      setMessage('Seller deleted successfully.');
      setConfirmAction(null);
      await loadSellers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete seller');
    } finally {
      setSaving(false);
    }
  };

  const viewSeller = async (sellerId) => {
    setLoading(true);
    try {
      const response = await getSellerDetails(sellerId);
      setSellerDetails(response?.data?.data || null);
      setViewingSellerId(sellerId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load seller details');
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter((seller) => seller.name.toLowerCase().includes(searchQuery.toLowerCase()) || seller.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusClass = (status) => {
    if (status === 'pending') return 'status status-pending';
    if (status === 'approved') return 'status status-delivered';
    if (status === 'rejected') return 'status status-cancelled';
    return 'status';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Partner accounts</p>
          <h1>Sellers</h1>
          <p className="admin-muted">Manage seller applications and partner accounts.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => { setIsCreateOpen(true); setMessage(''); setError(''); }}>Add seller</button>
      </div>

      {message ? <div className="admin-success admin-inline-error">{message}</div> : null}
      {error && !isCreateOpen && !rejectingId && !deleteId && !viewingSellerId ? <div className="admin-error admin-inline-error">{error}</div> : null}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <button type="button" onClick={() => setView('applications')} style={{ background: 'transparent', border: 'none', padding: '0.75rem 0', fontWeight: 700, color: view === 'applications' ? '#111827' : '#6b7280', borderBottom: view === 'applications' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer' }}>Applications</button>
        <button type="button" onClick={() => setView('sellers')} style={{ background: 'transparent', border: 'none', padding: '0.75rem 0', fontWeight: 700, color: view === 'sellers' ? '#111827' : '#6b7280', borderBottom: view === 'sellers' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer' }}>Approved sellers</button>
      </div>

      {view === 'applications' ? (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{ background: activeTab === tab.key ? '#111827' : '#fff', color: activeTab === tab.key ? '#fff' : '#374151', border: '1px solid #e5e7eb', borderRadius: 999, padding: '0.4rem 0.9rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? <div className="admin-state">Loading applications...</div> : (
            <section className="admin-panel table-panel">
              <div className="panel-heading">
                <div>
                  <p className="admin-kicker">Review queue</p>
                  <h2>{activeTab === 'all' ? 'All applications' : `${activeTab} applications`}</h2>
                </div>
                <span className="admin-count-label">{applications.length} total</span>
              </div>
              {applications.length === 0 ? <p className="admin-empty">No applications found.</p> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Business</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td><strong>{app.name}</strong></td>
                          <td>{app.email}</td>
                          <td>{app.businessName}</td>
                          <td><small>{new Date(app.createdAt).toLocaleDateString()}</small></td>
                          <td><span className={statusClass(app.status)}>{app.status}</span></td>
                           <td>
                             <button type="button" className="button-quiet" disabled={saving} onClick={() => setSelectedApp(app)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>View</button>
                             {app.status === 'pending' ? (
                               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                 <button type="button" className="button-primary" disabled={saving} onClick={() => handleApprove(app._id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
                                   {saving && rejectingId !== app._id ? 'Working...' : 'Approve'}
                                 </button>
                                 <button type="button" className="button-quiet" disabled={saving} onClick={() => { setRejectingId(app._id); setRejectionReason(''); }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', border: '1px solid #f7c6c2', color: '#9a2a22' }}>
                                   Reject
                                 </button>
                               </div>
                             ) : (
                               <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>—</span>
                             )}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {rejectingId && (
            <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setRejectingId(null); setRejectionReason(''); } }}>
              <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="reject-title">
                <div className="panel-heading">
                  <div>
                    <p className="admin-kicker">Review</p>
                    <h2 id="reject-title">Reject application</h2>
                  </div>
                  <button type="button" className="button-quiet" onClick={() => { setRejectingId(null); setRejectionReason(''); }}>Close</button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); handleReject(rejectingId); }}>
                  <label style={{ display: 'grid', gap: '7px', color: '#52645c', fontSize: '12px', fontWeight: 700 }}>
                    Rejection reason <span style={{ fontWeight: 400, color: '#6b7280' }}>(optional)</span>
                    <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d8e2dc', borderRadius: '5px', padding: '11px 12px', font: 'inherit', color: '#17211e' }} />
                  </label>
                  <div className="modal-actions">
                    <button type="button" className="button-quiet" onClick={() => { setRejectingId(null); setRejectionReason(''); }}>Cancel</button>
                    <button type="submit" className="button-primary" disabled={saving} style={{ background: '#9a2a22' }}>{saving ? 'Rejecting...' : 'Reject application'}</button>
                  </div>
                </form>
              </section>
            </div>
          )}
          
          {selectedApp && (
            <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedApp(null); } }}>
              <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="view-title">
                <div className="panel-heading">
                  <div>
                    <p className="admin-kicker">Application</p>
                    <h2 id="view-title">Seller application details</h2>
                  </div>
                  <button type="button" className="button-quiet" onClick={() => setSelectedApp(null)}>Close</button>
                </div>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Full name</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Email</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.email}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Phone</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business name</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.businessName}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Category</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.category}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Website</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {selectedApp.website ? <a href={selectedApp.website} target="_blank" rel="noreferrer noopener">{selectedApp.website}</a> : 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business description</p>
                    <p style={{ margin: 0 }}>{selectedApp.businessDescription}</p>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Business address</p>
                    <p style={{ margin: 0 }}>{selectedApp.businessAddress}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Submitted</p>
                      <p style={{ margin: 0 }}>{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Status</p>
                      <span className={statusClass(selectedApp.status)} style={{ textTransform: 'capitalize' }}>{selectedApp.status}</span>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Reviewed</p>
                      <p style={{ margin: 0 }}>{selectedApp.reviewedAt ? new Date(selectedApp.reviewedAt).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>

                  {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                    <div style={{ background: '#fef3f2', border: '1px solid #f7c6c2', borderRadius: 8, padding: '1rem' }}>
                      <p style={{ color: '#9a2a22', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Rejection reason</p>
                      <p style={{ margin: 0, color: '#9a2a22' }}>{selectedApp.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      ) : (
        <section className="admin-panel table-panel">
          <div className="panel-heading">
            <div>
              <p className="admin-kicker">Live register</p>
              <h2>All sellers</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sellers..." style={{ padding: '0.5rem 0.75rem', border: '1px solid #d8e2dc', borderRadius: 6, font: 'inherit', minWidth: 220 }} />
              <span className="admin-count-label">{filteredSellers.length} total</span>
            </div>
          </div>
          {filteredSellers.length === 0 ? <p className="admin-empty">No seller accounts found.</p> : (
            <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Products</th>
                    <th>Orders</th>
                    <th>Coupons</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller) => (
                    <tr key={seller._id}>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>{seller.name}</strong></td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller.email}</td>
                      <td>{seller.productCount}</td>
                      <td>{seller.orderCount}</td>
                      <td>{seller.couponCount}</td>
                      <td><span className={`status ${seller.isActive !== false ? 'status-delivered' : 'status-cancelled'}`}>{seller.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                      <td><small>{seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '—'}</small></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="button-quiet" onClick={() => viewSeller(seller._id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>View</button>
                          {seller.isActive !== false ? (
                            <button type="button" className="button-quiet" disabled={saving} onClick={() => setConfirmAction({ type: 'deactivate', id: seller._id })} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', border: '1px solid #f7c6c2', color: '#9a2a22' }}>Deactivate</button>
                          ) : (
                            <button type="button" className="button-primary" disabled={saving} onClick={() => handleActivate(seller._id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>Activate</button>
                          )}
                          <button type="button" className="danger-button" disabled={saving} onClick={() => setConfirmAction({ type: 'delete', id: seller._id })} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {isCreateOpen ? (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCreate(); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="add-seller-title">
            <div className="panel-heading">
              <div>
                <p className="admin-kicker">New partner</p>
                <h2 id="add-seller-title">Add seller</h2>
              </div>
              <button type="button" className="button-quiet" onClick={closeCreate}>Close</button>
            </div>
            <form className="seller-form" onSubmit={submitCreate}>
              <label>Full name<input name="name" value={form.name} onChange={change} autoComplete="name" required /></label>
              <label>Email<input name="email" type="email" value={form.email} onChange={change} autoComplete="email" required /></label>
              <label>Password<input name="password" type="password" minLength="8" value={form.password} onChange={change} autoComplete="new-password" required /></label>
              <label>Confirm password<input name="confirmPassword" type="password" minLength="8" value={form.confirmPassword} onChange={change} autoComplete="new-password" required /></label>
              {error ? <p className="admin-error">{error}</p> : null}
              <div className="modal-actions">
                <button type="button" className="button-quiet" onClick={closeCreate}>Cancel</button>
                <button type="submit" className="button-primary" disabled={saving}>{saving ? 'Creating...' : 'Create seller'}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {confirmAction ? (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAction(null); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-seller-title">
            <div className="panel-heading">
              <div>
                <p className="admin-kicker">Confirm</p>
                <h2 id="confirm-seller-title">{confirmAction.type === 'delete' ? 'Delete seller' : 'Deactivate seller'}</h2>
              </div>
              <button type="button" className="button-quiet" onClick={() => setConfirmAction(null)}>Close</button>
            </div>
            <p style={{ margin: '1rem 0' }}>
              {confirmAction.type === 'delete'
                ? 'Are you sure you want to delete this seller? This action cannot be undone.'
                : 'Are you sure you want to deactivate this seller? They will no longer be able to log in.'}
            </p>
            <div className="modal-actions">
              <button type="button" className="button-quiet" onClick={() => setConfirmAction(null)}>Cancel</button>
              {confirmAction.type === 'delete' ? (
                <button type="button" className="button-primary" disabled={saving} style={{ background: '#9a2a22' }} onClick={handleDelete}>{saving ? 'Deleting...' : 'Delete seller'}</button>
              ) : (
                <button type="button" className="button-primary" disabled={saving} style={{ background: '#9a2a22' }} onClick={() => handleDeactivate(confirmAction.id)}>{saving ? 'Deactivating...' : 'Deactivate seller'}</button>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {viewingSellerId && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setViewingSellerId(null); setSellerDetails(null); } }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="view-seller-title">
            <div className="panel-heading">
              <div>
                <p className="admin-kicker">Seller</p>
                <h2 id="view-seller-title">Seller details</h2>
              </div>
              <button type="button" className="button-quiet" onClick={() => { setViewingSellerId(null); setSellerDetails(null); }}>Close</button>
            </div>
            {sellerDetails ? <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Name</p><p style={{ margin: 0, fontWeight: 600 }}>{sellerDetails.name}</p></div>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Email</p><p style={{ margin: 0, fontWeight: 600 }}>{sellerDetails.email}</p></div>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Products</p><p style={{ margin: 0, fontWeight: 600 }}>{sellerDetails.productCount ?? 0}</p></div>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Orders</p><p style={{ margin: 0, fontWeight: 600 }}>{sellerDetails.orderCount ?? 0}</p></div>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Coupons</p><p style={{ margin: 0, fontWeight: 600 }}>{sellerDetails.couponCount ?? 0}</p></div>
                <div><p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Status</p><span className={`status ${sellerDetails.isActive !== false ? 'status-delivered' : 'status-cancelled'}`}>{sellerDetails.isActive !== false ? 'Active' : 'Inactive'}</span></div>
              </div>
            </div> : <p className="admin-state">Loading details...</p>}
          </section>
        </div>
      )}
    </div>
  );
}
