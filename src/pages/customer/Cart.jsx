import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    total,
    loading,
    error,
    fetchCart,
    updateQuantity,
    removeItem,
    selectedProductIds,
    selectedItems,
    areAllSelected,
    hasSelection,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, qty) => {
    if (qty < 1) return;
    await updateQuantity(productId, qty);
  };

  const handleSelectAllChange = () => {
    if (areAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  const selectedTotal = useMemo(
    () =>
      items
        .filter((item) => isSelected(item.product?._id))
        .reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [items, isSelected]
  );

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={areAllSelected}
            onChange={handleSelectAllChange}
          />
          <span>Select All</span>
        </label>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
          {selectedProductIds.length} of {items.length} selected
        </span>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {items.map((item) => {
          const productId = item.product?._id;
          const checked = productId ? isSelected(productId) : false;

          return (
            <div
              key={productId || item.productId}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 140px 1fr auto',
                gap: '1rem',
                padding: '1rem',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                alignItems: 'center',
                opacity: checked ? 1 : 0.85,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSelection(productId)}
              />
              <img
                src={item.product?.image}
                alt={item.product?.name}
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }}
              />
              <div>
                <h3>{item.product?.name}</h3>
                <p>$ {Number(item.product?.price || 0).toFixed(2)} each</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button type="button" onClick={() => handleQuantityChange(item.product?._id, Number(item.quantity) - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(item.product?._id, Number(item.quantity) + 1)}>
                    +
                  </button>
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>$ {Number(item.subtotal || 0).toFixed(2)}</p>
                <button type="button" onClick={() => removeItem(item.product?._id)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3>Cart summary</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          Total: $ {Number(total || 0).toFixed(2)}
        </p>
        {hasSelection ? (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>
              Selected total: $ {Number(selectedTotal || 0).toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              style={{
                display: 'inline-block',
                marginTop: '0.75rem',
                padding: '0.6rem 1.2rem',
                borderRadius: 8,
                background: '#111827',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Proceed to checkout ({selectedProductIds.length})
            </button>
          </>
        ) : (
          <p style={{ color: '#dc2626', marginTop: '0.75rem' }}>
            Select at least one item to proceed to checkout.
          </p>
        )}
      </div>
    </div>
  );
}
