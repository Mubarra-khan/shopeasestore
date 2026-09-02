require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const productIds = [
    new mongoose.Types.ObjectId('6a89e8cd02219b5808180e84'),
    new mongoose.Types.ObjectId('6a8fd382760797621158b7ef'),
  ];

  const ratings = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  console.log('Aggregate result:', JSON.stringify(ratings, null, 2));

  const ratingsMap = {};
  ratings.forEach((entry) => {
    ratingsMap[entry._id] = { averageRating: entry.avgRating, count: entry.count };
  });

  console.log('ratingsMap:', JSON.stringify(ratingsMap, null, 2));

  const products = await Product.find({ _id: { $in: productIds } });
  for (const product of products) {
    console.log(`Product ${product._id}:`);
    console.log(`  ratingsMap[product._id]?.averageRating = ${ratingsMap[product._id]?.averageRating}`);
    console.log(`  ratingsMap[product._id]?.count = ${ratingsMap[product._id]?.count}`);
    console.log(`  typeof product._id = ${typeof product._id}`);
    console.log(`  typeof ratingsMap keys = ${typeof Object.keys(ratingsMap)[0]}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
