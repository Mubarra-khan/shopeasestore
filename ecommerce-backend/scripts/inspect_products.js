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

  console.log('Existing spec counts:', counts);

  products.forEach((p, idx) => {
    const specs = {};
    fields.forEach((field) => {
      specs[field] = p[field] || '';
    });
    console.log(`Product ${idx + 1}: ${p.name} | category: ${p.category} | brand: "${specs.brand}" | color: "${specs.color}" | material: "${specs.material}"`);
  });

  await mongoose.disconnect();
  console.log('Disconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
