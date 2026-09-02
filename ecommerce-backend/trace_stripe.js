require('dotenv').config();
const Stripe = require('stripe');

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test Product' },
          unit_amount: 1000,
        },
        quantity: 1,
      },
    ],
    success_url: 'http://localhost:5173/payment/success?sessionId={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173/payment/cancelled',
  });

  console.log('Session ID:', session.id);
  console.log('Session URL:', session.url);
  console.log('Session URL type:', typeof session.url);
  console.log('Session URL starts with:', session.url?.substring(0, 30));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
