require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({ originalPrice: { $gt: 0 } });
  console.log('Products with originalPrice > 0:', products.length);
  products.forEach(p => {
    console.log(`  ${p._id}: ${p.name} | price=${p.price} | originalPrice=${p.originalPrice} | isForSale=${p.isForSale}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
