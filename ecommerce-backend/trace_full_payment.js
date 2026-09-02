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
  // Create admin
  const adminSignup = await request('POST', '/api/users/signup', {
    name: 'Admin', email: 'admin' + Date.now() + '@example.com', password: 'admin123'
  });
  // Set admin role directly in DB
  console.log('Admin signup:', adminSignup.status);

  // Actually, let me use the existing admin
  const adminLogin = await request('POST', '/api/users/login', { email: 'admin@example.com', password: 'admin123' });
  console.log('Admin login:', adminLogin.status, adminLogin.data?.message);
  
  let adminToken;
  if (adminLogin.status === 200) {
    adminToken = adminLogin.data.token;
  } else {
    console.log('No admin available, skipping product creation');
    return;
  }

  // Create product
  const product = await request('POST', '/api/products', {
    name: 'Test Product',
    description: 'Test description for payment flow',
    price: 10.00,
    category: 'Test',
    stock: 10,
    image: 'https://example.com/image.jpg',
  }, adminToken);
  console.log('Product:', product.status, product.data?.data?._id);

  // Create customer
  const customerSignup = await request('POST', '/api/users/signup', {
    name: 'Customer', email: 'cust' + Date.now() + '@example.com', password: 'password123'
  });
  console.log('Customer signup:', customerSignup.status);
  const customerEmail = customerSignup.data?.data?.email;

  const customerLogin = await request('POST', '/api/users/login', { email: customerEmail, password: 'password123' });
  console.log('Customer login:', customerLogin.status);
  const customerToken = customerLogin.data.token;

  // Add to cart
  const cart = await request('POST', '/api/cart', { productId: product.data?.data?._id, quantity: 1 }, customerToken);
  console.log('Add to cart:', cart.status);

  // Checkout
  const checkout = await request('POST', '/api/orders/checkout', {}, customerToken);
  console.log('Checkout:', checkout.status);
  console.log('Order ID:', checkout.data?.data?._id);
  console.log('Order paymentStatus:', checkout.data?.data?.paymentStatus);
  const orderId = checkout.data?.data?._id;

  // Create payment session
  if (orderId) {
    const session = await request('POST', `/api/orders/${orderId}/payment-session`, {}, customerToken);
    console.log('Payment session:', session.status);
    console.log('Session data:', JSON.stringify(session.data?.data));
    console.log('Session URL:', session.data?.data?.url);
    console.log('Session URL type:', typeof session.data?.data?.url);
  }
}

run().catch(console.error);
