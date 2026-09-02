require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const reviewCount = await Review.countDocuments({});
  console.log('Total reviews:', reviewCount);

  const reviews = await Review.find({}).limit(10);
  console.log('Sample reviews:', reviews.map(r => ({ product: r.product, rating: r.rating })));

  const productsWithOriginalPrice = await Product.find({ originalPrice: { $gt: 0 } }).limit(10);
  console.log('\nProducts with originalPrice > 0:');
  productsWithOriginalPrice.forEach(p => {
    console.log(`  ${p.name}: price=${p.price}, originalPrice=${p.originalPrice}, discount=${p.originalPrice > p.price ? Math.round((p.originalPrice - p.price) / p.originalPrice * 100) : 0}%`);
  });

  const productsWithoutOriginalPrice = await Product.find({ $or: [{ originalPrice: null }, { originalPrice: 0 }] }).limit(5);
  console.log('\nProducts without originalPrice:');
  productsWithoutOriginalPrice.forEach(p => {
    console.log(`  ${p.name}: price=${p.price}`);
  });

  await mongoose.disconnect();
  console.log('\nDisconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
