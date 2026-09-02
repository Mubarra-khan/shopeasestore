import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { items, total, loading, error, fetchCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, qty) => {
    if (qty < 1) return;
    await updateQuantity(productId, qty);
  };

  if (loading && items.length === 0) return <p>Loading cart...</p>;

  if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

  if (!items.length) {
    return (
      <div>
        <h2>Your cart is empty</h2>
        <p>Continue shopping to add products to your cart.</p>
        <Link to="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Your cart</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {items.map((item) => (
          <div key={item.product?._id || item.productId} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '1rem', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, alignItems: 'center' }}>
            <img src={item.product?.image} alt={item.product?.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }} />
            <div>
              <h3>{item.product?.name}</h3>
              <p>$ {Number(item.product?.price || 0).toFixed(2)} each</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" onClick={() => handleQuantityChange(item.product?._id, Number(item.quantity) - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(item.product?._id, Number(item.quantity) + 1)}>+</button>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 700 }}>$ {Number(item.subtotal || 0).toFixed(2)}</p>
              <button type="button" onClick={() => removeItem(item.product?._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3>Cart summary</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total: $ {Number(total || 0).toFixed(2)}</p>
        <Link to="/checkout" style={{ display: 'inline-block', marginTop: '0.75rem' }}>Proceed to checkout</Link>
      </div>
    </div>
  );
}
