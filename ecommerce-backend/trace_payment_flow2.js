const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('=== 0. Create fresh customer ===');
  const signup = await request('POST', '/api/users/signup', {
    name: 'Payment Flow Test',
    email: 'payflow' + Date.now() + '@example.com',
    password: 'password123',
  });
  console.log('Signup:', signup.status, signup.data?.data?.role, signup.data?.data?.email);
  const customerEmail = signup.data?.data?.email;
  
  console.log('\n=== 1. Customer login ===');
  const login = await request('POST', '/api/users/login', {
    email: customerEmail,
    password: 'password123',
  });
  console.log('Login:', login.status, login.data?.data?.role);
  const token = login.data.token;
  
  // Use existing product
  const productId = '6a85e788028e828e9c83706d';
  
  console.log('\n=== 2. Add to cart ===');
  const cart = await request('POST', '/api/cart', { productId, quantity: 1 }, token);
  console.log('Add to cart:', cart.status, cart.data?.message || cart.data?.success);
  
  console.log('\n=== 3. Checkout ===');
  const checkout = await request('POST', '/api/orders/checkout', {}, token);
  console.log('Checkout:', checkout.status);
  console.log('Order ID:', checkout.data?.data?._id);
  console.log('Order paymentStatus:', checkout.data?.data?.paymentStatus);
  console.log('Order status:', checkout.data?.data?.status);
  console.log('Order finalAmount:', checkout.data?.data?.finalAmount);
  const orderId = checkout.data?.data?._id;
  
  if (!orderId) {
    console.log('No order created, stopping');
    return;
  }
  
  console.log('\n=== 4. Create payment session ===');
  const session = await request('POST', `/api/orders/${orderId}/payment-session`, {}, token);
  console.log('Session API status:', session.status);
  console.log('Session response keys:', session.data ? Object.keys(session.data) : 'no data');
  console.log('Session data.data keys:', session.data?.data ? Object.keys(session.data.data) : 'no data.data');
  console.log('Session URL:', session.data?.data?.url);
  console.log('Session URL type:', typeof session.data?.data?.url);
  console.log('Session URL starts with:', session.data?.data?.url?.substring(0, 60));
  
  console.log('\n=== 5. Check order after payment session ===');
  const orderAfter = await request('GET', `/api/orders/${orderId}`, null, token);
  console.log('Order after:', orderAfter.status);
  console.log('Payment status:', orderAfter.data?.data?.paymentStatus);
  console.log('Stripe session ID:', orderAfter.data?.data?.stripeCheckoutSessionId);
  
  console.log('\n=== DONE ===');
}

run().catch(console.error);
