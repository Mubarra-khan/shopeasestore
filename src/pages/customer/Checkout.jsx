import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkoutOrder, createStripeSession } from '../../api/order.api';
import { validateCoupon } from '../../api/coupon.api';
import { useCart } from '../../context/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    selectedItems,
    hasSelection,
    fetchCart,
    clearCart,
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = useMemo(() => Number(selectedItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0), [selectedItems]);
  const discount = useMemo(() => Number(validatedCoupon?.discountAmount || 0), [validatedCoupon]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const updateShipping = (event) => {
    const { name, value } = event.target;
    setShippingAddress((current) => ({ ...current, [name]: value }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await validateCoupon({
        code: couponCode,
        orderAmount: subtotal,
      });

      const payload = response?.data?.data || response?.data;
      setValidatedCoupon(payload);
      setCouponCode(payload?.couponCode || couponCode);
    } catch (err) {
      setCouponError(err?.response?.data?.message || 'Unable to validate coupon');
      setValidatedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setValidatedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!hasSelection || !selectedItems.length) {
      setCheckoutError('Please select at least one cart item to checkout');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      if (paymentMethod === 'cod') {
        const response = await checkoutOrder({
          couponCode: validatedCoupon?.couponCode || undefined,
          shippingAddress,
          paymentMethod,
          items: selectedItems.map((item) => ({
            productId: item.product?._id || item.productId,
            quantity: item.quantity,
          })),
        });
        const order = response?.data?.data || response?.data;
        setCreatedOrder(order);
        return;
      }

      const paymentResponse = await createStripeSession({
        items: selectedItems.map((item) => ({
          productId: item.product?._id || item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        couponCode: validatedCoupon?.couponCode || undefined,
      });
      const paymentUrl = paymentResponse?.data?.data?.url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      setCheckoutError('No Stripe checkout URL returned by the backend');
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div>
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
        <Link to="/products">Continue shopping</Link>
      </div>
    );
  }

  if (!selectedItems.length) {
    return (
      <div>
        <h2>Checkout</h2>
        <p>Please select at least one item from your cart to proceed.</p>
        <Link to="/cart">Back to cart</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <h2>Checkout</h2>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {selectedItems.map((item) => (
          <div key={item.product?._id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #e2e8f0', background: '#fff', padding: '1rem', borderRadius: 12 }}>
            <div>
              <strong>{item.product?.name}</strong>
              <div>Qty: {item.quantity}</div>
            </div>
            <div>$ {Number(item.subtotal || 0).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
        <h3>Coupon</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" />
          <button type="button" onClick={applyCoupon} disabled={couponLoading}> {couponLoading ? 'Checking...' : 'Apply'} </button>
          {validatedCoupon ? <button type="button" onClick={clearCoupon}>Remove</button> : null}
        </div>

        {couponError ? <p style={{ color: 'crimson', marginTop: '0.75rem' }}>{couponError}</p> : null}

        {validatedCoupon ? (
          <div style={{ marginTop: '1rem', color: '#16a34a' }}>
            <p><strong>Coupon:</strong> {validatedCoupon.couponCode}</p>
            <p><strong>Original:</strong> $ {Number(validatedCoupon.originalOrderAmount || subtotal).toFixed(2)}</p>
            <p><strong>Discount:</strong> $ {Number(validatedCoupon.discountAmount || 0).toFixed(2)}</p>
            <p><strong>Final:</strong> $ {Number(validatedCoupon.finalOrderAmount || finalTotal).toFixed(2)}</p>
          </div>
        ) : null}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', maxWidth: '48rem', margin: 0, width: '100%' }}>
        <h3>Shipping address</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Full name
              <input name="fullName" value={shippingAddress.fullName} onChange={updateShipping} required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Phone
              <input name="phone" value={shippingAddress.phone} onChange={updateShipping} required />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Address line
            <input name="addressLine" value={shippingAddress.addressLine} onChange={updateShipping} required />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              City
              <input name="city" value={shippingAddress.city} onChange={updateShipping} required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              State/Province
              <input name="state" value={shippingAddress.state} onChange={updateShipping} required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Postal/ZIP code
              <input name="postalCode" value={shippingAddress.postalCode} onChange={updateShipping} required />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Country
            <input name="country" value={shippingAddress.country} onChange={updateShipping} required />
          </label>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
        <h3>Payment method</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={(event) => setPaymentMethod(event.target.value)} />
            <span>Stripe (Card)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(event) => setPaymentMethod(event.target.value)} />
            <span>Cash on Delivery</span>
          </label>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
        <h3>Order summary</h3>
        <p>Subtotal: $ {Number(subtotal).toFixed(2)}</p>
        <p>Discount: $ {Number(discount).toFixed(2)}</p>
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Final: $ {Number(finalTotal).toFixed(2)}</p>
        {checkoutError ? <p style={{ color: 'crimson' }}>{checkoutError}</p> : null}
        <button type="button" onClick={handleCheckout} disabled={checkoutLoading}>
          {checkoutLoading ? 'Processing...' : paymentMethod === 'cod' ? 'Place COD Order' : 'Checkout'}
        </button>
      </div>

      {createdOrder ? (
        <div style={{ background: '#f8fafc', border: '1px solid #dbeafe', borderRadius: 12, padding: '1rem' }}>
          <h3>Order created</h3>
          <p>Order ID: {createdOrder._id}</p>
          <p>Payment status: {createdOrder.paymentStatus}</p>
          <p>Payment method: {createdOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe'}</p>
          <p>Status: {createdOrder.status}</p>
          {createdOrder.paymentMethod === 'cod' ? (
            <p style={{ color: '#35652d' }}>Your COD order has been placed. Please prepare cash for delivery.</p>
          ) : (
            <Link to="/orders">View your orders</Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
