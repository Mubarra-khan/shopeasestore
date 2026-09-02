import { useEffect, useState } from 'react';
import { createBanner, deleteBanner, getAdminBanners, updateBanner, uploadBannerImage } from '../../api/banner.api';

const emptyForm = { title: '', subtitle: '', image: '', buttonText: '', link: '', category: '', sortOrder: 0, startDate: '', endDate: '', isActive: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [imageSource, setImageSource] = useState('url');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try { const response = await getAdminBanners(); setBanners(response?.data?.data || []); setError(''); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to load banners'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadBanners(); }, []);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const response = await uploadBannerImage(selectedFile);
      const imageUrl = response?.data?.data?.image;
      if (imageUrl) {
        setForm((current) => ({ ...current, image: imageUrl }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, sortOrder: Number(form.sortOrder || 0), startDate: form.startDate ? new Date(form.startDate).toISOString() : null, endDate: form.endDate ? new Date(form.endDate).toISOString() : null };
    try {
      if (editingId) await updateBanner(editingId, payload); else await createBanner(payload);
      setForm(emptyForm); setEditingId(null); setSelectedFile(null); setImagePreview(''); setImageSource('url');
      await loadBanners();
    } catch (err) { setError(err?.response?.data?.message || 'Unable to save banner'); }
    finally { setSaving(false); }
  };
  
  const edit = (banner) => {
    setForm({ title: banner.title, subtitle: banner.subtitle || '', image: banner.image, buttonText: banner.buttonText || '', link: banner.link || '', category: banner.category || '', sortOrder: String(banner.sortOrder ?? 0), startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '', endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '', isActive: banner.isActive });
    setImageSource(banner.image && (banner.image.startsWith('/uploads/') || /\/uploads\//.test(banner.image)) ? 'upload' : 'url');
    setImagePreview(banner.image || '');
    setSelectedFile(null);
  };
  
  const remove = async () => { if (!deleteId) return; try { await deleteBanner(deleteId); setDeleteId(null); await loadBanners(); } catch (err) { setError(err?.response?.data?.message || 'Unable to delete banner'); } };

  if (loading) return <div className="admin-state">Loading banners...</div>;
  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Marketing</p><h1>Banners</h1><p className="admin-muted">Manage homepage hero banners.</p></div><span className="admin-count-label">{banners.length} total</span></div>
    {error ? <div className="admin-error admin-inline-error">{error}</div> : null}
    <section className="admin-panel coupon-form-panel"><div className="panel-heading"><div><p className="admin-kicker">{editingId ? 'Edit' : 'New'}</p><h2>{editingId ? 'Update banner' : 'Create banner'}</h2></div>{editingId ? <button type="button" className="button-quiet" onClick={() => { setEditingId(null); setForm(emptyForm); setSelectedFile(null); setImagePreview(''); setImageSource('url'); }}>Cancel edit</button> : null}</div>
      <form className="coupon-form" onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <label>Title<input name="title" value={form.title} onChange={change} required /></label>
          <label>Subtitle<input name="subtitle" value={form.subtitle} onChange={change} /></label>
          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ marginBottom: '0.5rem' }}>Image Source</div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal' }}>
                <input type="radio" name="imageSource" checked={imageSource === 'url'} onChange={() => setImageSource('url')} /> Image URL
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal' }}>
                <input type="radio" name="imageSource" checked={imageSource === 'upload'} onChange={() => setImageSource('upload')} /> Upload / Choose from Gallery
              </label>
            </div>
            {imageSource === 'url' ? (
              <input name="image" value={form.image} onChange={change} placeholder="https://example.com/image.jpg" required={imageSource === 'url'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                <button type="button" onClick={handleUpload} disabled={!selectedFile || uploading} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            )}
            {imagePreview && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={imagePreview} alt="Preview" style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </div>
            )}
          </label>
          <label>Button text<input name="buttonText" value={form.buttonText} onChange={change} /></label>
          <label>Link<input name="link" value={form.link} onChange={change} /></label>
          <label>Category<input name="category" value={form.category} onChange={change} /></label>
          <label>Sort order<input name="sortOrder" type="number" value={form.sortOrder} onChange={change} /></label>
          <label>Start date<input name="startDate" type="datetime-local" value={form.startDate} onChange={change} /></label>
          <label>End date<input name="endDate" type="datetime-local" value={form.endDate} onChange={change} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" name="isActive" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} /> Active</label>
        </div>
        <button type="submit" className="button-primary" disabled={saving || uploading}>{saving || uploading ? 'Saving...' : editingId ? 'Save changes' : 'Create banner'}</button>
      </form>
    </section>
    <section className="admin-panel table-panel"><div className="panel-heading"><div><p className="admin-kicker">Live register</p><h2>All banners</h2></div></div>
      {banners.length === 0 ? <p className="admin-empty">No banners created yet.</p> : <div className="admin-table-wrap" style={{ overflowX: 'auto' }}><table className="admin-table">
        <thead><tr><th>Preview</th><th>Title</th><th>Subtitle</th><th>Link</th><th>Sort</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{banners.map((banner) => <tr key={banner._id}>
          <td><img src={banner.image} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} /></td>
          <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>{banner.title}</strong></td>
          <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.subtitle}</td>
          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.link ? <a href={banner.link} target="_blank" rel="noreferrer noopener">Link</a> : '—'}</td>
          <td>{banner.sortOrder}</td>
          <td><small>{banner.startDate ? new Date(banner.startDate).toLocaleDateString() : '—'} → {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : '—'}</small></td>
          <td><span className={`status ${banner.isActive ? 'status-delivered' : 'status-cancelled'}`}>{banner.isActive ? 'active' : 'inactive'}</span></td>
          <td><div className="row-actions"><button type="button" onClick={() => { setEditingId(banner._id); edit(banner); }}>Edit</button><button type="button" className="danger-button" onClick={() => setDeleteId(banner._id)}>Delete</button></div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
    {deleteId ? <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-banner-title">
        <div className="panel-heading"><div><p className="admin-kicker">Confirm</p><h2 id="delete-banner-title">Delete banner</h2></div><button type="button" className="button-quiet" onClick={() => setDeleteId(null)}>Close</button></div>
        <p style={{ margin: '1rem 0' }}>This action cannot be undone. Do you want to delete this banner?</p>
        <div className="modal-actions"><button type="button" className="button-quiet" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="button-primary" style={{ background: '#9a2a22' }} onClick={remove}>Delete</button></div>
      </section>
    </div> : null}
  </div>;
}
