require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const EXPANSIONS = [
  { search: /men t shirt/i, replacement: "Premium Men's Cotton Casual Regular Fit Comfortable Breathable T Shirt" },
  { search: /baby dress/i, replacement: "Soft Comfortable Cotton Baby Girls Printed Party Wear Frock Dress" },
  { search: /water bottle/i, replacement: "Premium Stainless Steel Insulated Water Bottle 1 Liter - BPA Free Leak Proof" },
  { search: /laptop/i, replacement: "High Performance Professional Laptop 16GB RAM 512GB SSD Fast Processor" },
  { search: /smartphone/i, replacement: "Latest Generation Smartphone 128GB Storage 8GB RAM Dual Camera 5G" },
  { search: /headphones/i, replacement: "Wireless Bluetooth Noise Cancelling Over-Ear Headphones with Deep Bass" },
  { search: /shoes/i, replacement: "Premium Quality Sports Running Shoes Lightweight Comfortable for Men and Women" },
  { search: /watch/i, replacement: "Elegant Men's Stainless Steel Analog Watch with Leather Strap Water Resistant" },
  { search: /backpack/i, replacement: "Durable Waterproof Travel Backpack 40L Laptop Compartment USB Charging Port" },
  { search: /sunglasses/i, replacement: "Classic Polarized UV Protection Sunglasses for Men and Women Unisex Fashion" },
  { search: /perfume/i, replacement: "Long Lasting Premium Eau de Parfum for Men 100ml Luxury Fragrance Spray" },
  { search: /sneakers/i, replacement: "Trendy Casual Sneakers for Men Comfortable Walking Shoes Lightweight Design" },
  { search: /hoodie/i, replacement: "Cozy Fleece Hoodie for Men Warm Pullover Sweatshirt Casual Wear" },
  { search: /jeans/i, replacement: "Slim Fit Stretchable Denim Jeans for Men Comfortable All-Day Wear" },
  { search: /kurti/i, replacement: "Elegant Printed Cotton Kurti for Women Regular Fit Daily Wear Top" },
  { search: /earbuds/i, replacement: "True Wireless Earbuds Bluetooth 5.3 with Charging Case Deep Bass Long Battery Life" },
  { search: /mouse/i, replacement: "Ergonomic Wireless Optical Mouse 2.4GHz USB Receiver Silent Click Design" },
  { search: /keyboard/i, replacement: "Mechanical Gaming Keyboard RGB Backlit Wired USB Anti-Ghosting Keys" },
  { search: /speaker/i, replacement: "Portable Bluetooth Speaker 10W Stereo Sound Waterproof Outdoor Wireless" },
  { search: /wallet/i, replacement: "Genuine Leather Wallet for Men RFID Blocking Slim Bifold Card Holder" },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({});
  console.log('Total products:', products.length);

  let updatedCount = 0;
  for (const product of products) {
    const expansion = EXPANSIONS.find((e) => e.search.test(product.name));
    if (!expansion) continue;

    const current = product.name || '';
    if (expansion.search.test(current) && current.length < expansion.replacement.length) {
      await Product.findByIdAndUpdate(product._id, { name: expansion.replacement });
      console.log(`Updated: "${current}" -> "${expansion.replacement}"`);
      updatedCount++;
    }
  }

  console.log('Products updated:', updatedCount);
  await mongoose.disconnect();
  console.log('Disconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
