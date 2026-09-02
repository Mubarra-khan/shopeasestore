require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const trueCount = await Product.countDocuments({ isForSale: true });
  const falseCount = await Product.countDocuments({ isForSale: false });
  const nullCount = await Product.countDocuments({ isForSale: null });
  const total = await Product.countDocuments({});

  console.log('Total products:', total);
  console.log('isForSale=true:', trueCount);
  console.log('isForSale=false:', falseCount);
  console.log('isForSale=null:', nullCount);

  // Also check products with originalPrice > 0
  const withOriginalPrice = await Product.find({ originalPrice: { $gt: 0 } }).limit(5);
  console.log('\nSample products with originalPrice > 0:');
  withOriginalPrice.forEach(p => {
    console.log(`  ${p._id}: ${p.name} | isForSale=${p.isForSale}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
