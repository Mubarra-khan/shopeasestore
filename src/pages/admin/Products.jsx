import { useEffect, useState } from 'react';
import { getProducts } from '../../api/product.api';

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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts().then((response) => setProducts(response?.data?.data || [])).catch((err) => setError(err?.response?.data?.message || 'Unable to load catalog')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-state">Loading catalog...</div>;
  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">Catalog</p><h1>Products</h1><p className="admin-muted">A live view of the storefront catalog.</p></div><span className="admin-count-label">{products.length} products</span></div>
    <div className="admin-notice"><strong>Read-only catalog</strong><span>The backend provides public product reads, but no admin product CRUD endpoint. Product changes remain available only through the existing seller API.</span></div>
    {error ? <div className="admin-error admin-inline-error">{error}</div> : null}
    <section className="admin-panel table-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Seller</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td><div className="product-cell"><img src={normalizeProductImage(product.image)} alt="" /><span><strong>{product.name}</strong><small>{product._id}</small></span></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong></td><td><span className={product.stock > 0 ? 'stock-good' : 'stock-empty'}>{product.stock}</span></td><td><small>{product.seller?.name || product.seller?.email || 'Seller unavailable'}</small></td></tr>)}</tbody></table></div></section>
  </div>;
}
