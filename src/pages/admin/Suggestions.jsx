import { useEffect, useState } from 'react';
import { getSuggestions, createSuggestion, updateSuggestion, deleteSuggestion, getCategories, getSubcategories, getProducts } from '../../api/product.api';

const emptyForm = { label: '', type: 'category', targetId: '', categoryId: '', order: 0, active: true };

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await getSuggestions();
      setSuggestions(response?.data?.data || []);
      setError('');
    } catch {
      setError('Unable to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
    getCategories().then((response) => {
      setCategories(response?.data?.data || response?.data || []);
    });
  }, []);

  useEffect(() => {
    if (form.type === 'subcategory') {
      const fetchSubcategories = async () => {
        const allSubs = [];
        for (const cat of categories) {
          try {
            const response = await getSubcategories(cat._id);
            const subs = response?.data?.data || response?.data || [];
            subs.forEach((sub) => {
              allSubs.push({ ...sub, categoryName: cat.name });
            });
          } catch {
            // ignore
          }
        }
        setSubcategories(allSubs);
      };
      fetchSubcategories();
    }
  }, [form.type, categories]);

  useEffect(() => {
    if (form.type === 'product') {
      const fetchProducts = async () => {
        try {
          const response = await getProducts({ limit: 1000 });
          const items = Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data) ? response.data : [];
          setProducts(items);
        } catch {
          setProducts([]);
        }
      };
      fetchProducts();
    }
  }, [form.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        label: form.label.trim(),
        type: form.type,
        targetId: form.targetId,
        categoryId: form.type === 'subcategory' ? form.categoryId : undefined,
        order: Number(form.order),
        active: form.active,
      };

      if (editingId) {
        await updateSuggestion(editingId, payload);
      } else {
        await createSuggestion(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadSuggestions();
    } catch {
      setError('Unable to save suggestion');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (suggestion) => {
    setEditingId(suggestion._id);
    setForm({
      label: suggestion.label,
      type: suggestion.type,
      targetId: suggestion.targetId,
      categoryId: suggestion.categoryId || '',
      order: suggestion.order,
      active: suggestion.active,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this suggestion?')) return;
    try {
      await deleteSuggestion(id);
      await loadSuggestions();
    } catch {
      setError('Unable to delete suggestion');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  if (loading) return <div className="admin-state">Loading suggestions...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Customer Experience</p>
          <h1>Trending Suggestions</h1>
          <p className="admin-muted">Manage the horizontal suggestion bar on the products/category listing page.</p>
        </div>
        <span className="admin-count-label">{suggestions.length} suggestions</span>
      </div>

      {error ? <div className="admin-error admin-inline-error">{error}</div> : null}

      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 18 }}>{editingId ? 'Edit suggestion' : 'Add a new suggestion'}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label>
              Display label
              <input name="label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required />
            </label>
            <label>
              Type
              <select name="type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, targetId: '' }))}>
                <option value="category">Category</option>
                <option value="subcategory">Sub-category</option>
                <option value="product">Product</option>
              </select>
            </label>
            <label>
              Select existing item
              <select name="targetId" value={form.targetId} onChange={(e) => setForm((f) => ({ ...f, targetId: e.target.value }))} required>
                <option value="">-- select --</option>
                {form.type === 'category' && categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
                {form.type === 'subcategory' && subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.categoryName} &gt; {sub.name}</option>
                ))}
                {form.type === 'product' && products.map((product) => (
                  <option key={product._id} value={product._id}>{product.name}</option>
                ))}
              </select>
            </label>
            {form.type === 'subcategory' && (
              <label>
                Parent category
                <select name="categoryId" value={form.categoryId || ''} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} required>
                  <option value="">-- select parent category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Order
              <input name="order" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 18 }}>
            <button type="submit" className="button-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create suggestion'}</button>
            {editingId && <button type="button" className="button-quiet" onClick={cancelEdit}>Cancel edit</button>}
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <h2 style={{ marginBottom: 18 }}>Existing suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="admin-muted">No suggestions yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Target ID</th>
                  <th>Order</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.label}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.type}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.targetId}</td>
                    <td>{s.order}</td>
                    <td>{s.active ? 'Yes' : 'No'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="button-small" onClick={() => startEdit(s)}>Edit</button>
                        <button type="button" className="button-small button-danger" onClick={() => handleDelete(s._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
