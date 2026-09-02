require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const updates = [
    {
      name: 'Apple iPhone 16 Pro Max 256GB Unlocked Smartphone with Advanced Dual Camera System and 5G Connectivity',
      match: { name: 'Apple iPhone 16' },
    },
    {
      name: 'Premium Cotton Crew Neck T-Shirt for Men and Women Ultra Soft Breathable Casual Fit Tee Perfect for Everyday Wear Sports Outdoor Activities and Travel',
      match: { name: 'T-shirts', category: 'Baby & Kids' },
    },
  ];

  for (const update of updates) {
    const result = await Product.findOneAndUpdate(update.match, { name: update.name }, { new: true });
    if (result) {
      console.log(`Updated: ${result._id} -> ${result.name}`);
    } else {
      console.log(`Not found: ${update.match.name}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
