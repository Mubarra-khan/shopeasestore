#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const User = require("../src/models/user.model");
const Order = require("../src/models/Order");

const imageUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`;

const products = [
  {
    name: "Acer Swift Edge 16",
    description: "A lightweight 16-inch laptop with an OLED display, fast multitasking performance, and all-day battery life for work and study.",
    price: 1099,
    image: imageUrl("photo-1496181133206-80ce9b88a853"),
    category: "Laptops",
    stock: 12,
  },
  {
    name: "Lenovo ThinkPad E14 Gen 5",
    description: "A dependable business laptop with a comfortable keyboard, strong security features, and a durable aluminum chassis.",
    price: 899,
    image: imageUrl("photo-1593642702821-c8da6771f0c6"),
    category: "Laptops",
    stock: 9,
  },
  {
    name: "ASUS ROG Zephyrus G14",
    description: "A compact gaming laptop with a high-refresh display, dedicated graphics, and a powerful processor for demanding games and creative work.",
    price: 1699,
    image: imageUrl("photo-1593642702821-c8da6771f0c6"),
    category: "Laptops",
    stock: 7,
  },
  {
    name: "HP Pavilion Plus 14",
    description: "A polished everyday laptop with a sharp display, responsive performance, and a slim design for home and office use.",
    price: 749,
    image: imageUrl("photo-1484788984921-03950022c9ef"),
    category: "Laptops",
    stock: 15,
  },
  {
    name: "Dell Inspiron 16 Plus",
    description: "A spacious 16-inch productivity laptop with a comfortable keyboard, vivid screen, and ample power for multitasking.",
    price: 1199,
    image: imageUrl("photo-1525547719571-a2d4ac8945e2"),
    category: "Laptops",
    stock: 10,
  },
  {
    name: "Microsoft Surface Laptop 5",
    description: "A refined touchscreen laptop with quiet performance, premium materials, and a portable profile for everyday productivity.",
    price: 1299,
    image: imageUrl("photo-1496181133206-80ce9b88a853"),
    category: "Laptops",
    stock: 8,
  },
  {
    name: "Apple MacBook Air M2",
    description: "A silent, fanless laptop with a bright display, excellent battery life, and smooth performance for creative and professional tasks.",
    price: 999,
    image: imageUrl("photo-1593642702821-c8da6771f0c6"),
    category: "Laptops",
    stock: 14,
  },
  {
    name: "MSI Creator M16",
    description: "A creator-focused laptop with a color-rich display, dedicated graphics, and the performance needed for editing and design work.",
    price: 1399,
    image: imageUrl("photo-1593642702821-c8da6771f0c6"),
    category: "Laptops",
    stock: 6,
  },
  {
    name: "Samsung Galaxy Book4 Pro",
    description: "A thin premium laptop with an AMOLED display, long battery life, and seamless productivity across compatible Galaxy devices.",
    price: 1449,
    image: imageUrl("photo-1484788984921-03950022c9ef"),
    category: "Laptops",
    stock: 11,
  },
  {
    name: "Framework Laptop 13",
    description: "A modular laptop designed for easy upgrades and repairs, with strong everyday performance and a crisp high-resolution display.",
    price: 1049,
    image: imageUrl("photo-1525547719571-a2d4ac8945e2"),
    category: "Laptops",
    stock: 13,
  },
  {
    name: "Google Pixel 9 Pro",
    description: "A premium Android smartphone with an advanced camera system, bright OLED display, and intelligent everyday features.",
    price: 999,
    image: imageUrl("photo-1511707171634-5f897ff02aa9"),
    category: "Smartphones",
    stock: 16,
  },
  {
    name: "Samsung Galaxy S25",
    description: "A flagship smartphone with a fast processor, versatile cameras, vivid display, and a refined water-resistant design.",
    price: 899,
    image: imageUrl("photo-1510557880182-3d4d3cba35a5"),
    category: "Smartphones",
    stock: 18,
  },
  {
    name: "Apple iPhone 16",
    description: "A powerful smartphone with a bright Super Retina display, advanced camera controls, and dependable all-day battery life.",
    price: 799,
    image: imageUrl("photo-1592899677977-9c10ca588bbd"),
    category: "Smartphones",
    stock: 20,
  },
  {
    name: "OnePlus 13",
    description: "A fast premium phone with a smooth high-refresh display, capable cameras, and rapid charging for busy days.",
    price: 799,
    image: imageUrl("photo-1511707171634-5f897ff02aa9"),
    category: "Smartphones",
    stock: 12,
  },
  {
    name: "Sony Xperia 1 VI",
    description: "A media-focused smartphone with a cinematic display, detailed cameras, expandable storage, and high-fidelity audio.",
    price: 1299,
    image: imageUrl("photo-1510557880182-3d4d3cba35a5"),
    category: "Smartphones",
    stock: 7,
  },
  {
    name: "Nothing Phone 3a Pro",
    description: "A distinctive midrange phone with a clean interface, sharp cameras, bright display, and strong battery endurance.",
    price: 459,
    image: imageUrl("photo-1592899677977-9c10ca588bbd"),
    category: "Smartphones",
    stock: 15,
  },
  {
    name: "Motorola Edge 50 Ultra",
    description: "A stylish smartphone with a curved display, fast charging, high-resolution cameras, and smooth everyday performance.",
    price: 699,
    image: imageUrl("photo-1511707171634-5f897ff02aa9"),
    category: "Smartphones",
    stock: 10,
  },
  {
    name: "Xiaomi 14T Pro",
    description: "A feature-rich phone with a sharp AMOLED panel, flagship-grade processing, and a versatile triple-camera setup.",
    price: 649,
    image: imageUrl("photo-1510557880182-3d4d3cba35a5"),
    category: "Smartphones",
    stock: 9,
  },
  {
    name: "ASUS Zenfone 11 Ultra",
    description: "A compact-friendly flagship with smooth performance, a large high-refresh screen, and reliable battery life.",
    price: 899,
    image: imageUrl("photo-1592899677977-9c10ca588bbd"),
    category: "Smartphones",
    stock: 8,
  },
  {
    name: "Nokia X30 5G",
    description: "A durable 5G smartphone with a clean Android experience, bright display, and recycled-material construction.",
    price: 349,
    image: imageUrl("photo-1511707171634-5f897ff02aa9"),
    category: "Smartphones",
    stock: 17,
  },
  {
    name: "Logitech MX Master 3S",
    description: "A quiet wireless productivity mouse with an ergonomic shape, precise tracking, and multi-device connectivity.",
    price: 99,
    image: imageUrl("photo-1527814050087-3793815479db"),
    category: "Accessories",
    stock: 20,
  },
  {
    name: "Keychron K8 Pro Mechanical Keyboard",
    description: "A tenkeyless mechanical keyboard with hot-swappable switches, wireless connectivity, and customizable backlighting.",
    price: 109,
    image: imageUrl("photo-1587829741301-dc798b83add3"),
    category: "Accessories",
    stock: 14,
  },
  {
    name: "Sony WH-1000XM5 Headset",
    description: "Premium wireless over-ear headphones with adaptive noise cancellation, clear calls, and comfortable all-day wear.",
    price: 349,
    image: imageUrl("photo-1505740420928-5e560c06d30e"),
    category: "Accessories",
    stock: 11,
  },
  {
    name: "Logitech Brio 4K Webcam",
    description: "A sharp 4K webcam with automatic light correction, stereo microphones, and flexible framing for video meetings.",
    price: 149,
    image: imageUrl("photo-1587825140708-dfaf72ae4b04"),
    category: "Accessories",
    stock: 13,
  },
  {
    name: "Anker 7-in-1 USB-C Hub",
    description: "A compact USB-C hub with HDMI, USB-A, card reader, and power delivery ports for flexible laptop connectivity.",
    price: 59,
    image: imageUrl("photo-1625842268584-8f3296236761"),
    category: "Accessories",
    stock: 18,
  },
  {
    name: "Rain Design mStand Laptop Stand",
    description: "A sturdy aluminum laptop stand that raises the screen for better posture and creates useful desk space below.",
    price: 49,
    image: imageUrl("photo-1527443224154-c4a3942d3acf"),
    category: "Accessories",
    stock: 16,
  },
  {
    name: "Samsung T7 Shield External SSD",
    description: "A rugged portable SSD with fast USB-C transfers, compact storage, and dust and water resistance for mobile workflows.",
    price: 129,
    image: imageUrl("photo-1597872200969-2b65d56bd16b"),
    category: "Accessories",
    stock: 10,
  },
  {
    name: "Logitech MX Keys S Wireless Keyboard",
    description: "A low-profile wireless keyboard with quiet, precise keys, smart backlighting, and easy switching between devices.",
    price: 109,
    image: imageUrl("photo-1587829741301-dc798b83add3"),
    category: "Accessories",
    stock: 12,
  },
  {
    name: "JBL Charge 5 Bluetooth Speaker",
    description: "A portable Bluetooth speaker with bold sound, a durable waterproof build, and a battery designed for outdoor listening.",
    price: 179,
    image: imageUrl("photo-1608043152269-423dbba4e7e1"),
    category: "Accessories",
    stock: 15,
  },
  {
    name: "Ergotron LX Monitor Arm",
    description: "A fully adjustable monitor arm that frees desk space and provides smooth height, depth, and viewing-angle adjustment.",
    price: 189,
    image: imageUrl("photo-1527443195645-1133f7f28990"),
    category: "Accessories",
    stock: 8,
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const seller = await User.findOne({ role: "seller" }).select("_id");
  if (!seller) {
    throw new Error("No existing seller account found");
  }

  const securityProduct = await Product.findById("6a85e788028e828e9c83706d");
  if (!securityProduct) {
    throw new Error("Security Test Laptop was not found");
  }

  securityProduct.image = imageUrl("photo-1496181133206-80ce9b88a853");
  await securityProduct.save();

  const existingNames = new Set(
    (await Product.find({ name: { $in: products.map((product) => product.name) } }).select("name"))
      .map((product) => product.name)
  );
  const missingProducts = products
    .filter((product) => !existingNames.has(product.name))
    .map((product) => ({ ...product, seller: seller._id }));

  if (missingProducts.length) {
    await Product.insertMany(missingProducts);
  }

  await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: { image: product.image } },
      },
    }))
  );

  const seededProducts = await Product.find({ name: { $in: products.map((product) => product.name) } })
    .select("category stock image seller");
  const categoryCounts = seededProducts.reduce((counts, product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});
  const orders = await Order.countDocuments();

  console.log(JSON.stringify({
    created: missingProducts.length,
    totalSeedProducts: seededProducts.length,
    categoryCounts,
    allStockPositive: seededProducts.every((product) => product.stock > 0),
    allImagesPresent: seededProducts.every((product) => Boolean(product.image)),
    allSellersPresent: seededProducts.every((product) => Boolean(product.seller)),
    securityImageUpdated: securityProduct.image,
    orderCount: orders,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });