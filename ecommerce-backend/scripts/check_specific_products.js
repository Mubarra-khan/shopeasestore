require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const reviewProductIds = [
    new mongoose.Types.ObjectId('6a89e8cd02219b5808180e84'),
    new mongoose.Types.ObjectId('6a8fd382760797621158b7ef'),
  ];

  const products = await Product.find({ _id: { $in: reviewProductIds } });
  console.log('Products with reviews:');
  for (const p of products) {
    const reviews = await Review.find({ product: p._id });
    const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
    console.log(`  ${p._id}: ${p.name}`);
    console.log(`    price=${p.price}, originalPrice=${p.originalPrice}, isForSale=${p.isForSale}`);
    console.log(`    reviews: ${reviews.length}, avgRating=${avg.toFixed(2)}`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
