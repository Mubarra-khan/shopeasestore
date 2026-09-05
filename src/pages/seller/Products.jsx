import { useEffect, useState } from 'react';
import { createSellerProduct, deleteSellerProduct, getSellerProducts, updateSellerProduct, uploadSellerProductImage, uploadSellerProductVideo } from '../../api/seller.api';
import { getCategories, getSubcategories, getChildSubcategories } from '../../api/product.api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  category: '',
  categoryRef: '',
  subcategoryRef: '',
  childSubcategoryRef: '',
  stock: '',
  descriptionImages: [],
  images: [],
  productVideos: [],
  brand: '',
  color: '',
  material: '',
  age: '',
  service: '',
  promotion: '',
  deliveryFrom: '',
  warrantyType: '',
  warrantyPeriod: '',
  storageRequirement: '',
  isForSale: true,
};

const money = (value) => `$ ${Number(value || 0).toFixed(2)}`;

const normalizeProductImage = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://localhost:5000/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const origin = apiUrl.replace(/\/api\/?$/, '');
    return url.replace('http://localhost:5000', origin);
  }
  return url;
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [childSubcategories, setChildSubcategories] = useState([]);
  const [descriptionImages, setDescriptionImages] = useState([]);
  const [uploadingDescriptionImage, setUploadingDescriptionImage] = useState(false);
  const [descriptionImageError, setDescriptionImageError] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [productImageError, setProductImageError] = useState('');
  const [productVideos, setProductVideos] = useState([]);
  const [uploadingProductVideo, setUploadingProductVideo] = useState(false);
  const [productVideoError, setProductVideoError] = useState('');
  const [productVideoUrl, setProductVideoUrl] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getSellerProducts();
      const products = (response?.data?.data || []).map((product) => ({
        ...product,
        image: normalizeProductImage(product.image),
        images: (product.images || []).map(normalizeProductImage),
        descriptionImages: (product.descriptionImages || []).map(normalizeProductImage),
      }));
      setProducts(products);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response?.data?.data || []);
      } catch {
        // categories are optional
      }
    };

    fetchCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!form.categoryRef) {
        setSubcategories([]);
        return;
      }

      try {
        const response = await getSubcategories(form.categoryRef);
        const all = response?.data?.data || [];
        setSubcategories(all.filter((sub) => !sub.parent));
      } catch {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [form.categoryRef]);

  useEffect(() => {
    const fetchChildSubcategories = async () => {
      if (!form.subcategoryRef) {
        setChildSubcategories([]);
        return;
      }

      try {
        const response = await getChildSubcategories(form.subcategoryRef);
        setChildSubcategories(response?.data?.data || []);
      } catch {
        setChildSubcategories([]);
      }
    };

    fetchChildSubcategories();
  }, [form.subcategoryRef]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'categoryRef') {
        next.subcategoryRef = '';
        next.childSubcategoryRef = '';
      }
      if (name === 'subcategoryRef') {
        next.childSubcategoryRef = '';
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
    setUploadedImageUrl('');
    setImagePreview('');
    setImageError('');
    setSubcategories([]);
    setChildSubcategories([]);
    setDescriptionImages([]);
    setDescriptionImageError('');
    setProductImages([]);
    setProductImageError('');
    setProductVideos([]);
    setProductVideoError('');
    setProductVideoUrl('');
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Choose a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    setSelectedImage(file);
    setUploadedImageUrl('');
    setImagePreview(URL.createObjectURL(file));
    setImageError('');
  };

  const handleImageUrlError = () => setImageError('This image URL could not be loaded.');

  const handleProductImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingProductImage(true);
    setProductImageError('');
    try {
      const uploads = await Promise.all(files.map((file) => uploadSellerProductImage(file)));
      const urls = uploads.map((res) => res?.data?.data?.image).filter(Boolean);
      setProductImages((current) => [...current, ...urls]);
    } catch {
      setProductImageError('One or more images failed to upload. Please try again.');
    } finally {
      setUploadingProductImage(false);
      event.target.value = '';
    }
  };

  const handleRemoveProductImage = (index) => {
    setProductImages((current) => current.filter((_, i) => i !== index));
  };

  const handleSetMainImage = (url) => {
    setForm((current) => ({ ...current, image: url }));
    setImagePreview(url);
    setUploadedImageUrl(url);
    setSelectedImage(null);
    setProductImages((current) => current.filter((img) => img !== url));
  };

  const handleProductVideoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingProductVideo(true);
    setProductVideoError('');
    try {
      const uploads = await Promise.all(files.map((file) => uploadSellerProductVideo(file)));
      const urls = uploads.map((res) => res?.data?.data?.video).filter(Boolean);
      setProductVideos((current) => {
        const seen = new Set(current);
        const next = [...current];
        urls.forEach((url) => {
          if (!seen.has(url)) {
            seen.add(url);
            next.push(url);
          }
        });
        return next;
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'One or more videos failed to upload. Please try again.';
      setProductVideoError(message);
    } finally {
      setUploadingProductVideo(false);
      event.target.value = '';
    }
  };

  const handleAddProductVideoUrl = () => {
    const url = productVideoUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      setProductVideoError('Please enter a valid video URL starting with http:// or https://');
      return;
    }
    if (productVideos.includes(url)) {
      setProductVideoError('This video URL is already added.');
      return;
    }
    setProductVideos((current) => [...current, url]);
    setProductVideoUrl('');
    setProductVideoError('');
  };

  const handleRemoveProductVideo = (index) => {
    setProductVideos((current) => current.filter((_, i) => i !== index));
  };

  const handleDescriptionImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setDescriptionImageError('Choose a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    setUploadingDescriptionImage(true);
    setDescriptionImageError('');
    try {
      const response = await uploadSellerProductImage(file);
      const url = response?.data?.data?.image;
      if (url) {
        setDescriptionImages((current) => [...current, url]);
      }
    } catch {
      setDescriptionImageError('Image upload failed. Please try again.');
    } finally {
      setUploadingDescriptionImage(false);
      event.target.value = '';
    }
  };

  const handleRemoveDescriptionImage = (index) => {
    setDescriptionImages((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setImageError('');

    try {
      const imageUrl = form.image.trim();
      if (!selectedImage && !uploadedImageUrl && !imageUrl) {
        setImageError('Please provide an image URL or upload an image.');
        setIsSubmitting(false);
        return;
      }
      let image = uploadedImageUrl || imageUrl;
      if (selectedImage) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadSellerProductImage(selectedImage);
          image = uploadResponse?.data?.data?.image;
          if (!image) throw new Error('Upload response did not include an image URL');
          setUploadedImageUrl(image);
          setForm((current) => ({ ...current, image }));
        } catch (err) {
          throw new Error(err?.response?.data?.message || 'Image upload failed. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
      if (!image) {
        setImageError('Please provide an image URL or upload an image.');
        setIsSubmitting(false);
        return;
      }

      const categoryDisplay = form.categoryRef ? categories.find((c) => c._id === form.categoryRef)?.name || form.category : form.category;
      const payload = {
        ...form,
        image,
        price: Number(form.price),
        stock: Number(form.stock),
        category: categoryDisplay || form.category,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        images: productImages,
        descriptionImages,
        productVideos,
        isForSale: form.isForSale,
      };

      if (!payload.subcategoryRef) delete payload.subcategoryRef;
      if (!payload.childSubcategoryRef) delete payload.childSubcategoryRef;

      if (editingId) {
        await updateSellerProduct(editingId, payload);
      } else {
        await createSellerProduct(payload);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setIsUploading(false);
      setError(err?.response?.data?.message || `Product could not be saved: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: normalizeProductImage(product.image),
      category: product.category,
      categoryRef: product.categoryRef?._id || '',
      subcategoryRef: product.subcategoryRef ? product.subcategoryRef.toString() : '',
      childSubcategoryRef: product.childSubcategoryRef ? product.childSubcategoryRef.toString() : '',
      stock: String(product.stock),
      descriptionImages: (product.descriptionImages || []).map(normalizeProductImage),
      images: (product.images || []).map(normalizeProductImage),
      productVideos: product.productVideos || [],
      brand: product.brand || '',
      color: product.color || '',
      material: product.material || '',
      age: product.age || '',
      service: product.service || '',
      promotion: product.promotion || '',
      deliveryFrom: product.deliveryFrom || '',
      warrantyType: product.warrantyType || '',
      warrantyPeriod: product.warrantyPeriod || '',
      storageRequirement: product.storageRequirement || '',
      isForSale: product.isForSale ?? true,
    });
    setSelectedImage(null);
    setUploadedImageUrl('');
    setImagePreview(normalizeProductImage(product.image) || '');
    setImageError('');
    setDescriptionImages((product.descriptionImages || []).map(normalizeProductImage));
    setDescriptionImageError('');
    setProductImages((product.images || []).map(normalizeProductImage));
    setProductImageError('');
    setProductVideos(product.productVideos || []);
    setProductVideoError('');
    setProductVideoUrl('');
  };

  const handleDelete = async (productId) => {
    setError('');
    try {
      await deleteSellerProduct(productId);
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete product');
    }
  };

  if (loading) return <div className="seller-state">Loading products...</div>;

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Catalog</p>
          <h1>My Products</h1>
          <p className="seller-muted">Manage every product you own and keep inventory current.</p>
        </div>
        <span className="seller-count-label">{products.length} products</span>
      </div>

      <div className="seller-page-card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 18 }}>{editingId ? 'Edit product' : 'Add a new product'}</h2>
        {error ? <div className="seller-error" style={{ marginBottom: 18 }}>{error}</div> : null}
        <form className="seller-form" onSubmit={handleSubmit}>
          <div className="seller-form-grid">
            <label>
              Product name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Category
              <select name="categoryRef" value={form.categoryRef} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </label>
            <label>
              Subcategory
              <select name="subcategoryRef" value={form.subcategoryRef} onChange={handleChange} disabled={!form.categoryRef}>
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
              </select>
            </label>
            <label>
              Child Subcategory
              <select name="childSubcategoryRef" value={form.childSubcategoryRef} onChange={handleChange} disabled={!form.subcategoryRef || childSubcategories.length === 0}>
                <option value="">Select child subcategory</option>
                {childSubcategories.map((child) => <option key={child._id} value={child._id}>{child.name}</option>)}
              </select>
            </label>
            <label>
              Price
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Original Price
              <input name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="Optional - for discounts" />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input type="checkbox" name="isForSale" checked={form.isForSale} onChange={(e) => setForm((current) => ({ ...current, isForSale: e.target.checked }))} />
              <span>For Sale</span>
            </label>
            {form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
              <div style={{ gridColumn: '1 / -1', padding: '0.75rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <strong>Discount preview:</strong> {money(form.originalPrice)} → <strong style={{ color: '#16a34a' }}>{money(form.price)}</strong> ({Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% OFF)
              </div>
            )}
            <label>
              Stock
              <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
            </label>
            <div className="seller-image-field" style={{ gridColumn: '1 / -1' }}>
              <span className="seller-field-label">Product image</span>
              <label className="seller-upload-button">
                Choose from PC
                <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleImageSelect} />
              </label>
              <span className="seller-image-or">or</span>
              <label>
                Image URL
                <input name="image" type="url" value={form.image} onChange={(event) => { handleChange(event); setUploadedImageUrl(''); setImagePreview(event.target.value); setImageError(''); }} />
              </label>
              {imagePreview ? <img className="seller-image-preview" src={imagePreview} alt="Selected product preview" onError={handleImageUrlError} /> : null}
              {imageError ? <p className="seller-error seller-image-error">{imageError}</p> : null}
              <span className="seller-image-help">Use either an image URL or upload an image from your PC. This will be the main product image.</span>
            </div>
            <div className="seller-image-field" style={{ gridColumn: '1 / -1' }}>
              <span className="seller-field-label">Additional product images</span>
              <label className="seller-upload-button">
                {uploadingProductImage ? 'Uploading...' : 'Add images'}
                <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple onChange={handleProductImageUpload} disabled={uploadingProductImage} />
              </label>
              {productImageError ? <p className="seller-error seller-image-error">{productImageError}</p> : null}
              <span className="seller-image-help">Upload multiple images. Click "Set as main" to make any image the cover image.</span>
              {productImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {productImages.map((url, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img src={url} alt={`Product ${index + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: form.image === url ? '2px solid #F85606' : '1px solid #d7e0dc' }} />
                      <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => handleSetMainImage(url)} style={{ background: '#F85606', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>Main</button>
                        <button type="button" onClick={() => handleRemoveProductImage(index)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="seller-image-field" style={{ gridColumn: '1 / -1' }}>
              <span className="seller-field-label">Description images</span>
              <label className="seller-upload-button">
                {uploadingDescriptionImage ? 'Uploading...' : 'Add image'}
                <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleDescriptionImageUpload} disabled={uploadingDescriptionImage} />
              </label>
              {descriptionImageError ? <p className="seller-error seller-image-error">{descriptionImageError}</p> : null}
              <span className="seller-image-help">Upload multiple images for the product description. You can remove images before saving.</span>
              {descriptionImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {descriptionImages.map((url, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img src={url} alt={`Description ${index + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #d7e0dc' }} />
                      <button type="button" onClick={() => handleRemoveDescriptionImage(index)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="seller-image-field" style={{ gridColumn: '1 / -1' }}>
              <span className="seller-field-label">Product videos</span>
              <label className="seller-upload-button">
                {uploadingProductVideo ? 'Uploading...' : 'Add video'}
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov" multiple onChange={handleProductVideoUpload} disabled={uploadingProductVideo} />
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input
                  type="url"
                  value={productVideoUrl}
                  onChange={(e) => setProductVideoUrl(e.target.value)}
                  placeholder="Paste video URL (MP4, WEBM, OGG, MOV)"
                  style={{ flex: 1, padding: '0.5rem 0.6rem', border: '1px solid #d8e2dc', borderRadius: 6, fontSize: '0.85rem' }}
                />
                <button type="button" onClick={handleAddProductVideoUrl} style={{ padding: '0.5rem 0.75rem', border: '1px solid #d8e2dc', background: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Add URL</button>
              </div>
              {productVideoError ? <p className="seller-error seller-image-error">{productVideoError}</p> : null}
              <span className="seller-image-help">Upload videos from your PC or paste a direct video URL. Supported formats: MP4, WEBM, OGG, MOV. Maximum 50 MB per video.</span>
              {productVideos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {productVideos.map((url, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #d7e0dc' }}>
                      <video src={url} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={() => handleRemoveProductVideo(index)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} required />
            </label>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <strong style={{ fontSize: '0.85rem', color: '#111827' }}>Product specifications</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}> Add any details that help buyers choose this product. Leave irrelevant fields empty.</span>
              <div className="seller-form-grid" style={{ marginTop: '0.5rem' }}>
                <label><span>Brand</span><input name="brand" value={form.brand} onChange={handleChange} /></label>
                <label><span>Colour</span><input name="color" value={form.color} onChange={handleChange} /></label>
                <label><span>Material</span><input name="material" value={form.material} onChange={handleChange} /></label>
                <label><span>Age / suitable age</span><input name="age" value={form.age} onChange={handleChange} /></label>
                <label><span>Service</span><input name="service" value={form.service} onChange={handleChange} /></label>
                <label><span>Promotion</span><input name="promotion" value={form.promotion} onChange={handleChange} /></label>
                <label><span>Delivery from</span><input name="deliveryFrom" value={form.deliveryFrom} onChange={handleChange} /></label>
                <label><span>Warranty type</span><input name="warrantyType" value={form.warrantyType} onChange={handleChange} /></label>
                <label><span>Warranty period</span><input name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleChange} /></label>
                <label><span>Storage requirement</span><input name="storageRequirement" value={form.storageRequirement} onChange={handleChange} /></label>
              </div>
            </div>
          </div>
          <div className="seller-action-row">
            <button type="submit" className="seller-button" disabled={isSubmitting || isUploading}>{isUploading ? 'Uploading image...' : isSubmitting ? 'Saving...' : editingId ? 'Update product' : 'Add product'}</button>
            {editingId ? <button type="button" className="seller-button-secondary" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </div>

      <section className="seller-panel table-panel">
        {products.length === 0 ? (
          <p className="seller-empty">You do not have any products yet.</p>
        ) : (
          <div className="seller-table-wrap">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <img src={product.image} alt={product.name} />
                        <span>
                          <strong>{product.name}</strong>
                          <small>{product._id}</small>
                        </span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div>
                          <div><strong style={{ color: '#16a34a' }}>{money(product.price)}</strong></div>
                          <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.8rem' }}>{money(product.originalPrice)}</div>
                          <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</div>
                        </div>
                      ) : (
                        <strong>{money(product.price)}</strong>
                      )}
                    </td>
                    <td><span className={product.stock > 0 ? 'stock-good' : 'stock-empty'}>{product.stock}</span></td>
                    <td>
                      <div className="seller-action-row">
                        <button type="button" className="seller-button-secondary" onClick={() => startEdit(product)}>Edit</button>
                        <button type="button" className="seller-button-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
