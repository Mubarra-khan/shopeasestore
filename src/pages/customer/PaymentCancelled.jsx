import { Link } from 'react-router-dom';

export default function PaymentCancelled() {
  return (
    <div style={{ maxWidth: 640, margin: '4rem auto', textAlign: 'center' }}>
      <h2>Payment cancelled</h2>
      <p>Your payment was cancelled. You can review your cart or return to checkout to try again.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <Link to="/checkout">Return to checkout</Link>
        <Link to="/cart">View cart</Link>
        <Link to="/products">Continue shopping</Link>
      </div>
    </div>
  );
}
