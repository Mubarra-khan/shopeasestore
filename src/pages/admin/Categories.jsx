import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory, getChildSubcategories, createChildSubcategory, updateChildSubcategory, deleteChildSubcategory } from '../../api/category.api';

const emptyCategory = { name: '', slug: '', description: '', image: '', isActive: true };
const emptySubcategory = { name: '', slug: '', isActive: true };
const emptyChildSubcategory = { name: '', slug: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [subcategoryForm, setSubcategoryForm] = useState(emptySubcategory);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [childSubcategories, setChildSubcategories] = useState([]);
  const [childSubcategoryForm, setChildSubcategoryForm] = useState(emptyChildSubcategory);
  const [editingChildSubcategoryId, setEditingChildSubcategoryId] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories();
      setCategories(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubcategories([]);
        return;
      }

      try {
        const response = await getSubcategories(selectedCategoryId);
        const all = response?.data?.data || [];
        setSubcategories(all.filter((sub) => !sub.parent));
      } catch {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchChildSubcategories = async () => {
      if (!selectedSubcategoryId) {
        setChildSubcategories([]);
        return;
      }

      try {
        const response = await getChildSubcategories(selectedSubcategoryId);
        setChildSubcategories(response?.data?.data || []);
      } catch {
        setChildSubcategories([]);
      }
    };

    fetchChildSubcategories();
  }, [selectedSubcategoryId]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim(),
        isActive: categoryForm.isActive,
      };

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
      } else {
        await createCategory(payload);
      }

      setCategoryForm(emptyCategory);
      setEditingCategoryId(null);
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: subcategoryForm.name.trim(),
        slug: subcategoryForm.slug.trim(),
        isActive: subcategoryForm.isActive,
      };

      if (editingSubcategoryId) {
        await updateSubcategory(editingSubcategoryId, payload);
      } else {
        await createSubcategory(selectedCategoryId, payload);
      }

      setSubcategoryForm(emptySubcategory);
      setEditingSubcategoryId(null);
      const response = await getSubcategories(selectedCategoryId);
      setSubcategories(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive !== false,
    });
  };

  const startEditSubcategory = (subcategory) => {
    setEditingSubcategoryId(subcategory._id);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      isActive: subcategory.isActive !== false,
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? This cannot be undone.')) return;
    try {
      await deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId('');
        setSubcategories([]);
      }
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete category');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Delete this subcategory? This cannot be undone.')) return;
    try {
      await deleteSubcategory(id);
      const response = await getSubcategories(selectedCategoryId);
      setSubcategories(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete subcategory');
    }
  };

  const handleChildSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubcategoryId) return;
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: childSubcategoryForm.name.trim(),
        slug: childSubcategoryForm.slug.trim(),
        isActive: childSubcategoryForm.isActive,
      };

      if (editingChildSubcategoryId) {
        await updateChildSubcategory(editingChildSubcategoryId, payload);
      } else {
        await createChildSubcategory(selectedSubcategoryId, payload);
      }

      setChildSubcategoryForm(emptyChildSubcategory);
      setEditingChildSubcategoryId(null);
      const response = await getChildSubcategories(selectedSubcategoryId);
      setChildSubcategories(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save child subcategory');
    } finally {
      setSaving(false);
    }
  };

  const startEditChildSubcategory = (childSubcategory) => {
    setEditingChildSubcategoryId(childSubcategory._id);
    setChildSubcategoryForm({
      name: childSubcategory.name,
      slug: childSubcategory.slug,
      isActive: childSubcategory.isActive !== false,
    });
  };

  const handleDeleteChildSubcategory = async (id) => {
    if (!window.confirm('Delete this child subcategory? This cannot be undone.')) return;
    try {
      await deleteChildSubcategory(id);
      const response = await getChildSubcategories(selectedSubcategoryId);
      setChildSubcategories(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete child subcategory');
    }
  };

  if (loading) return <div className="admin-state">Loading categories...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Catalog</p>
          <h1>Categories</h1>
          <p className="admin-muted">Manage marketplace categories and subcategories.</p>
        </div>
        <span className="admin-count-label">{categories.length} categories</span>
      </div>

      {error ? <div className="admin-error admin-inline-error">{error}</div> : null}

      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 18 }}>{editingCategoryId ? 'Edit category' : 'Add a new category'}</h2>
        <form className="admin-form" onSubmit={handleCategorySubmit}>
          <div className="admin-form-grid">
            <label>
              Name
              <input value={categoryForm.name} onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label>
              Slug
              <input value={categoryForm.slug} onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))} required />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea value={categoryForm.description} onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <label>
              Image URL
              <input value={categoryForm.image} onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.value }))} />
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm((f) => ({ ...f, isActive: e.target.checked }))} />
              Active
            </label>
          </div>
          <div className="admin-action-row">
            <button type="submit" className="admin-button" disabled={saving}>{saving ? 'Saving...' : editingCategoryId ? 'Update category' : 'Create category'}</button>
            {editingCategoryId ? <button type="button" className="admin-button-secondary" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategory); }}>Cancel</button> : null}
          </div>
        </form>
      </div>

      <section className="admin-panel table-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No categories yet.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td><strong>{cat.name}</strong></td>
                    <td><small>{cat.slug}</small></td>
                    <td><span className={cat.isActive !== false ? 'stock-good' : 'stock-empty'}>{cat.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td><button type="button" className="admin-button-secondary" onClick={() => setSelectedCategoryId(cat._id === selectedCategoryId ? '' : cat._id)}>{cat._id === selectedCategoryId ? 'Hide' : 'Manage'}</button></td>
                    <td>
                      <div className="admin-action-row">
                        <button type="button" className="admin-button-secondary" onClick={() => startEditCategory(cat)}>Edit</button>
                        <button type="button" className="admin-button-danger" onClick={() => handleDeleteCategory(cat._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCategoryId && (
        <>
           <section className="admin-panel table-panel" style={{ marginTop: 24 }}>
           <h2 style={{ marginBottom: 18 }}>Subcategories</h2>
          <form className="admin-form" onSubmit={handleSubcategorySubmit} style={{ marginBottom: 18 }}>
            <div className="admin-form-grid">
              <label>
                Name
                <input value={subcategoryForm.name} onChange={(e) => setSubcategoryForm((f) => ({ ...f, name: e.target.value }))} required />
              </label>
              <label>
                Slug
                <input value={subcategoryForm.slug} onChange={(e) => setSubcategoryForm((f) => ({ ...f, slug: e.target.value }))} required />
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="checkbox" checked={subcategoryForm.isActive} onChange={(e) => setSubcategoryForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div className="admin-action-row">
              <button type="submit" className="admin-button" disabled={saving}>{saving ? 'Saving...' : editingSubcategoryId ? 'Update subcategory' : 'Add subcategory'}</button>
              {editingSubcategoryId ? <button type="button" className="admin-button-secondary" onClick={() => { setEditingSubcategoryId(null); setSubcategoryForm(emptySubcategory); }}>Cancel</button> : null}
            </div>
          </form>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>No subcategories yet.</td></tr>
                ) : (
                  subcategories.map((sub) => (
                    <tr key={sub._id}>
                      <td><strong>{sub.name}</strong></td>
                      <td><small>{sub.slug}</small></td>
                      <td><span className={sub.isActive !== false ? 'stock-good' : 'stock-empty'}>{sub.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div className="admin-action-row">
                            <button type="button" className="admin-button-secondary" onClick={() => startEditSubcategory(sub)}>Edit</button>
                            <button type="button" className="admin-button-danger" onClick={() => handleDeleteSubcategory(sub._id)}>Delete</button>
                            <button type="button" className="admin-button-secondary" onClick={() => setSelectedSubcategoryId(sub._id === selectedSubcategoryId ? '' : sub._id)}>{sub._id === selectedSubcategoryId ? 'Hide children' : 'Manage children'}</button>
                          </div>
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {selectedSubcategoryId && (
          <section className="admin-panel table-panel" style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 18 }}>Child Subcategories</h2>
            <form className="admin-form" onSubmit={handleChildSubcategorySubmit} style={{ marginBottom: 18 }}>
              <div className="admin-form-grid">
                <label>
                  Name
                  <input value={childSubcategoryForm.name} onChange={(e) => setChildSubcategoryForm((f) => ({ ...f, name: e.target.value }))} required />
                </label>
                <label>
                  Slug
                  <input value={childSubcategoryForm.slug} onChange={(e) => setChildSubcategoryForm((f) => ({ ...f, slug: e.target.value }))} required />
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="checkbox" checked={childSubcategoryForm.isActive} onChange={(e) => setChildSubcategoryForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Active
                </label>
              </div>
              <div className="admin-action-row">
                <button type="submit" className="admin-button" disabled={saving}>{saving ? 'Saving...' : editingChildSubcategoryId ? 'Update child subcategory' : 'Add child subcategory'}</button>
                {editingChildSubcategoryId ? <button type="button" className="admin-button-secondary" onClick={() => { setEditingChildSubcategoryId(null); setChildSubcategoryForm(emptyChildSubcategory); }}>Cancel</button> : null}
              </div>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {childSubcategories.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>No child subcategories yet.</td></tr>
                  ) : (
                    childSubcategories.map((child) => (
                      <tr key={child._id}>
                        <td style={{ verticalAlign: 'top' }}><strong>{child.name}</strong></td>
                        <td style={{ verticalAlign: 'top' }}><small>{child.slug}</small></td>
                        <td style={{ verticalAlign: 'top' }}><span className={child.isActive !== false ? 'stock-good' : 'stock-empty'}>{child.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                        <td style={{ verticalAlign: 'top' }}>
                          <div className="admin-action-row">
                            <button type="button" className="admin-button-secondary" onClick={() => startEditChildSubcategory(child)}>Edit</button>
                            <button type="button" className="admin-button-danger" onClick={() => handleDeleteChildSubcategory(child._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </>
      )}
    </div>
  );
}
