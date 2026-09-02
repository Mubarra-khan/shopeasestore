require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({}).sort({ _id: 1 });
  console.log('Total products:', products.length);

  let shortCount = 0;
  let longCount = 0;
  const shortNames = [];

  for (const p of products) {
    if ((p.name || '').length > 60) {
      longCount++;
    } else {
      shortCount++;
      shortNames.push({ _id: p._id, name: p.name, brand: p.brand, category: p.category, material: p.material, color: p.color });
    }
  }

  console.log('Already long (>60 chars):', longCount);
  console.log('Short names needing expansion:', shortCount);
  console.log('\nShort products:');
  shortNames.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} | category: ${p.category} | brand: ${p.brand} | material: ${p.material} | color: ${p.color}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
