require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({});
  console.log('Total products:', products.length);

  const fields = ['brand', 'color', 'material', 'age', 'service', 'promotion', 'deliveryFrom', 'warrantyType', 'warrantyPeriod', 'storageRequirement'];
  const counts = {};
  fields.forEach((field) => {
    counts[field] = products.filter((p) => p[field] && String(p[field]).trim()).length;
  });
  console.log('Populated spec counts:', counts);

  const sampleIds = [products[0]?._id, products[20]?._id, products[50]?._id, products[100]?._id, products[164]?._id].filter(Boolean);
  for (const id of sampleIds) {
    const p = await Product.findById(id);
    console.log(`\nSample: ${p.name} (${p.category})`);
    fields.forEach((f) => {
      console.log(`  ${f}: ${p[f] || ''}`);
    });
  }

  await mongoose.disconnect();
  console.log('\nDisconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
