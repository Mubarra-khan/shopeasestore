require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await Product.countDocuments({});
  console.log('Total products:', total);

  const sample = await Product.find({}).sort({ _id: 1 }).limit(5);
  console.log('\nSample products (all fields):');
  sample.forEach(p => {
    console.log(JSON.stringify({
      _id: p._id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
    }));
  });

  await mongoose.disconnect();
}

main().catch(console.error);
