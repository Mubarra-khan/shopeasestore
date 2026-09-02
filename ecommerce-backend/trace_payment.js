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
  // Create a test product first
  // Actually, we need a product in the cart. Let me create a product and cart, then checkout.
  // But wait, we need a seller to create a product. Let me use an existing seller or create one.
  
  // Actually, the checkout uses the cart. Let me check if there's already a cart or if I need to create one.
  // For simplicity, let me just call the checkout endpoint with an empty cart and see what happens.
  
  // First, signup customer
  const signup = await request('POST', '/api/users/signup', {
    name: 'Payment Test', email: 'paytest' + Date.now() + '@example.com', password: 'password123'
  });
  console.log('Signup:', signup.status, signup.data?.data?.role);
  const email = signup.data?.data?.email;

  const login = await request('POST', '/api/users/login', { email, password: 'password123' });
  console.log('Login:', login.status);
  const token = login.data.token;

  // Try checkout with empty cart
  console.log('\n=== Checkout with empty cart ===');
  const checkout = await request('POST', '/api/orders/checkout', {}, token);
  console.log('Checkout:', checkout.status, checkout.data?.message);

  // If we need a real product, let me check the database for existing products
  // Actually, let me just call the payment-session endpoint with a fake order ID to see what happens
  console.log('\n=== Payment session with fake order ID ===');
  const session = await request('POST', '/api/orders/fakeid/payment-session', {}, token);
  console.log('Session:', session.status, session.data?.message);
}

run().catch(console.error);
