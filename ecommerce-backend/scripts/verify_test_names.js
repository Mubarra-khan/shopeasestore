require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({ name: { $in: [
    'Apple iPhone 16',
    'Apple iPhone 16 Pro Max 256GB Unlocked Smartphone with Advanced Dual Camera System and 5G Connectivity',
    'T-shirts',
    'Premium Cotton Crew Neck T-Shirt for Men and Women Ultra Soft Breathable Casual Fit Tee Perfect for Everyday Wear Sports Outdoor Activities and Travel',
    'USB-C Fast Charger 65W',
  ]}});

  console.log('Test products:');
  products.forEach(p => {
    console.log(`  ${p._id}: ${p.name}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
