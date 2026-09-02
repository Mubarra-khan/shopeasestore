require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const Product = require('./src/models/Product');
const Cart = require('./src/models/Cart');
const Order = require('./src/models/Order');
const mongoose = require('mongoose');

async function main() {
  await connectDB();
  
  // Check existing data
  const seller = await User.findOne({ role: 'seller' }).select('_id email');
  const product = await Product.findOne();
  const customer = await User.findOne({ role: 'customer' }).select('_id email');
  
  console.log('Existing seller:', seller ? { id: seller._id, email: seller.email } : 'None');
  console.log('Existing product:', product ? { id: product._id, name: product.name } : 'None');
  console.log('Existing customer:', customer ? { id: customer._id, email: customer.email } : 'None');
  
  // If no seller, create one
  if (!seller) {
    const newSeller = await User.create({
      name: 'Test Seller',
      email: 'testseller' + Date.now() + '@example.com',
      password: 'password123',
      role: 'seller',
    });
    console.log('Created seller:', newSeller._id);
    
    // Create a product
    const newProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product for payment flow',
      price: 10.00,
      category: 'Test',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      seller: newSeller._id,
    });
    console.log('Created product:', newProduct._id);
  }
  
  // If no customer, create one
  if (!customer) {
    const newCustomer = await User.create({
      name: 'Test Customer',
      email: 'testcust' + Date.now() + '@example.com',
      password: 'password123',
      role: 'customer',
    });
    console.log('Created customer:', newCustomer._id);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
