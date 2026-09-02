#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const User = require('../src/models/user.model');

const categoryImageMap = {
  'electronics': 'https://images.unsplash.com/photo-1498041135514-ede4eaa90c53?auto=format&fit=crop&w=600&q=80',
  'fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1522335789203-aabd20f1b5f4?auto=format&fit=crop&w=600&q=80',
  'health-wellness': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  'groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'sports-fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  'automotive': 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=600&q=80',
  'books-stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'toys-games': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80',
  'baby-kids': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
  'jewelry-accessories': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  'tools-hardware': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
  'garden-outdoor': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  'pet-supplies': 'https://images.unsplash.com/photo-1450778869180-41d0601e047e?auto=format&fit=crop&w=600&q=80',
  'travel-luggage': 'https://images.unsplash.com/photo-1553531384-411a247ccd73?auto=format&fit=crop&w=600&q=80',
  'office-business': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
  'appliances': 'https://images.unsplash.com/photo-1571175446050-ef58a70b94b3?auto=format&fit=crop&w=600&q=80',
  'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  'beauty': 'https://images.unsplash.com/photo-1522335789203-aabd20f1b5f4?auto=format&fit=crop&w=600&q=80',
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to:', mongoose.connection.name);

  const categories = await Category.find({});
  let imagesAdded = 0;
  for (const cat of categories) {
    const img = categoryImageMap[cat.slug] || `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80`;
    if (!cat.image) {
      cat.image = img;
      await cat.save();
      imagesAdded++;
    }
  }
  console.log(`Categories updated with images: ${imagesAdded}`);

  const sellers = await User.find({ role: 'seller' }).select('_id');
  if (!sellers.length) {
    throw new Error('No sellers found');
  }

  const allCategories = await Category.find({}).select('_id name slug');
  const categoryMap = {};
  allCategories.forEach(c => { categoryMap[c._id.toString()] = c; });

  const productTemplates = [
    { name: 'Wireless Bluetooth Headphones', priceRange: [25, 120], category: 'electronics' },
    { name: 'Smart Watch Series 8', priceRange: [150, 400], category: 'electronics' },
    { name: 'Portable Power Bank 20000mAh', priceRange: [20, 60], category: 'electronics' },
    { name: 'USB-C Fast Charger 65W', priceRange: [15, 45], category: 'electronics' },
    { name: 'Mechanical Gaming Keyboard', priceRange: [40, 150], category: 'electronics' },
    { name: '4K Webcam with Ring Light', priceRange: [50, 120], category: 'electronics' },
    { name: 'Noise Cancelling Earbuds', priceRange: [30, 100], category: 'electronics' },
    { name: 'Laptop Stand Adjustable', priceRange: [20, 70], category: 'electronics' },
    { name: 'Wireless Mouse Ergonomic', priceRange: [15, 50], category: 'electronics' },
    { name: '27-inch IPS Monitor', priceRange: [180, 350], category: 'electronics' },
    { name: 'Portable SSD 1TB', priceRange: [60, 120], category: 'electronics' },
    { name: 'Smart Home Hub', priceRange: [40, 100], category: 'electronics' },
    { name: 'Men\'s Casual Shirt', priceRange: [15, 50], category: 'fashion' },
    { name: 'Women\'s Summer Dress', priceRange: [20, 60], category: 'fashion' },
    { name: 'Leather Wallet for Men', priceRange: [20, 80], category: 'fashion' },
    { name: 'Running Shoes Lightweight', priceRange: [40, 120], category: 'fashion' },
    { name: 'Cotton T-Shirt Pack', priceRange: [15, 40], category: 'fashion' },
    { name: 'Sunglasses Polarized', priceRange: [20, 90], category: 'fashion' },
    { name: 'Backpack 25L Waterproof', priceRange: [25, 70], category: 'fashion' },
    { name: 'Winter Jacket Insulated', priceRange: [50, 150], category: 'fashion' },
    { name: 'Silk Tie Set', priceRange: [15, 45], category: 'fashion' },
    { name: 'Yoga Pants High Waist', priceRange: [20, 55], category: 'fashion' },
    { name: 'Kids Cotton Hoodie', priceRange: [12, 35], category: 'fashion' },
    { name: 'Face Moisturizer SPF 50', priceRange: [10, 40], category: 'beauty-personal-care' },
    { name: 'Organic Hair Oil', priceRange: [8, 25], category: 'beauty-personal-care' },
    { name: 'Matte Lipstick Set', priceRange: [12, 35], category: 'beauty-personal-care' },
    { name: 'Electric Toothbrush', priceRange: [25, 80], category: 'beauty-personal-care' },
    { name: 'Men\'s Beard Trimmer', priceRange: [15, 50], category: 'beauty-personal-care' },
    { name: 'Perfume Eau de Toilette', priceRange: [30, 90], category: 'beauty-personal-care' },
    { name: 'Makeup Brush Set', priceRange: [10, 35], category: 'beauty-personal-care' },
    { name: 'Vitamin C Serum', priceRange: [12, 40], category: 'beauty-personal-care' },
    { name: 'Multivitamin Gummies', priceRange: [10, 30], category: 'health-wellness' },
    { name: 'Digital Blood Pressure Monitor', priceRange: [25, 70], category: 'health-wellness' },
    { name: 'Resistance Bands Set', priceRange: [10, 35], category: 'health-wellness' },
    { name: 'Orthopedic Pillow', priceRange: [20, 60], category: 'health-wellness' },
    { name: 'First Aid Kit Complete', priceRange: [15, 45], category: 'health-wellness' },
    { name: 'Gel Ice Pack Reusable', priceRange: [8, 20], category: 'health-wellness' },
    { name: 'Stainless Steel Water Bottle', priceRange: [10, 30], category: 'health-wellness' },
    { name: 'Non-Stick Frying Pan', priceRange: [15, 50], category: 'home-kitchen' },
    { name: 'Cotton Bed Sheet Set', priceRange: [20, 60], category: 'home-kitchen' },
    { name: 'LED Desk Lamp', priceRange: [15, 45], category: 'home-kitchen' },
    { name: 'Robot Vacuum Cleaner', priceRange: [150, 400], category: 'home-kitchen' },
    { name: 'Kitchen Knife Set', priceRange: [20, 80], category: 'home-kitchen' },
    { name: 'Bamboo Cutting Board', priceRange: [10, 30], category: 'home-kitchen' },
    { name: 'Air Purifier HEPA', priceRange: [80, 200], category: 'home-kitchen' },
    { name: 'Organic Basmati Rice 5kg', priceRange: [8, 20], category: 'groceries' },
    { name: 'Extra Virgin Olive Oil 1L', priceRange: [6, 18], category: 'groceries' },
    { name: 'Dark Chocolate 70%', priceRange: [3, 10], category: 'groceries' },
    { name: 'Green Tea Box 100 bags', priceRange: [5, 15], category: 'groceries' },
    { name: 'Mixed Nuts 500g', priceRange: [6, 18], category: 'groceries' },
    { name: 'Honey Raw 500g', priceRange: [8, 20], category: 'groceries' },
    { name: 'Yoga Mat Non-Slip', priceRange: [12, 40], category: 'sports-fitness' },
    { name: 'Dumbbells Set 20kg', priceRange: [40, 120], category: 'sports-fitness' },
    { name: 'Jump Rope Speed', priceRange: [8, 25], category: 'sports-fitness' },
    { name: 'Cycling Gloves', priceRange: [10, 35], category: 'sports-fitness' },
    { name: 'Tennis Racket Carbon', priceRange: [40, 120], category: 'sports-fitness' },
    { name: 'Camping Tent 4-Person', priceRange: [60, 180], category: 'sports-fitness' },
    { name: 'Car Phone Mount', priceRange: [8, 25], category: 'automotive' },
    { name: 'Microfiber Car Wash Cloth', priceRange: [5, 15], category: 'automotive' },
    { name: 'LED Car Interior Lights', priceRange: [10, 35], category: 'automotive' },
    { name: 'Dash Camera Full HD', priceRange: [40, 100], category: 'automotive' },
    { name: 'Tire Pressure Gauge', priceRange: [8, 25], category: 'automotive' },
    { name: 'Notebook A5 Hardcover', priceRange: [5, 15], category: 'books-stationery' },
    { name: 'Gel Pen Set 12 Colors', priceRange: [4, 12], category: 'books-stationery' },
    { name: 'Office Desk Organizer', priceRange: [10, 30], category: 'books-stationery' },
    { name: 'Whiteboard Marker Pack', priceRange: [5, 15], category: 'books-stationery' },
    { name: 'A4 Printer Paper 500 sheets', priceRange: [4, 12], category: 'books-stationery' },
    { name: 'Building Blocks 1000 pcs', priceRange: [20, 50], category: 'toys-games' },
    { name: 'Board Game Strategy', priceRange: [15, 45], category: 'toys-games' },
    { name: 'Remote Control Car', priceRange: [20, 60], category: 'toys-games' },
    { name: 'Puzzle 1000 Pieces', priceRange: [10, 25], category: 'toys-games' },
    { name: 'Stuffed Animal Large', priceRange: [15, 40], category: 'toys-games' },
    { name: 'Baby Onesie Cotton', priceRange: [8, 20], category: 'baby-kids' },
    { name: 'Diapers Size 4 Pack', priceRange: [15, 40], category: 'baby-kids' },
    { name: 'Baby Bottle Sterilizer', priceRange: [25, 70], category: 'baby-kids' },
    { name: 'Kids Scooter 3-Wheel', priceRange: [25, 60], category: 'baby-kids' },
    { name: 'Wooden Crib', priceRange: [120, 300], category: 'baby-kids' },
    { name: 'Silver Pendant Necklace', priceRange: [30, 100], category: 'jewelry-accessories' },
    { name: 'Stainless Steel Watch', priceRange: [50, 150], category: 'jewelry-accessories' },
    { name: 'Leather Belt Genuine', priceRange: [15, 50], category: 'jewelry-accessories' },
    { name: 'Anklet Gold Plated', priceRange: [10, 35], category: 'jewelry-accessories' },
    { name: 'Stud Earrings Set', priceRange: [12, 40], category: 'jewelry-accessories' },
    { name: 'Cordless Drill 18V', priceRange: [50, 140], category: 'tools-hardware' },
    { name: 'Tape Measure 5m', priceRange: [5, 15], category: 'tools-hardware' },
    { name: 'Socket Set 40-Piece', priceRange: [20, 60], category: 'tools-hardware' },
    { name: 'Safety Helmet Construction', priceRange: [8, 25], category: 'tools-hardware' },
    { name: 'LED Work Light', priceRange: [10, 30], category: 'tools-hardware' },
    { name: 'Garden Hose 50m', priceRange: [15, 45], category: 'garden-outdoor' },
    { name: 'Plant Pot Ceramic', priceRange: [10, 35], category: 'garden-outdoor' },
    { name: 'Solar Garden Lights', priceRange: [15, 40], category: 'garden-outdoor' },
    { name: 'BBQ Grill Cover', priceRange: [12, 35], category: 'garden-outdoor' },
    { name: 'Bird Feeder Hanging', priceRange: [8, 25], category: 'garden-outdoor' },
    { name: 'Premium Dog Food 10kg', priceRange: [20, 55], category: 'pet-supplies' },
    { name: 'Cat Scratching Post', priceRange: [15, 45], category: 'pet-supplies' },
    { name: 'Aquarium Filter', priceRange: [15, 50], category: 'pet-supplies' },
    { name: 'Pet Grooming Kit', priceRange: [12, 35], category: 'pet-supplies' },
    { name: 'Dog Leash Reflective', priceRange: [8, 25], category: 'pet-supplies' },
    { name: 'Hard-shell Suitcase 24 inch', priceRange: [60, 150], category: 'travel-luggage' },
    { name: 'Travel Pillow Memory Foam', priceRange: [12, 35], category: 'travel-luggage' },
    { name: 'Packing Cubes Set', priceRange: [15, 40], category: 'travel-luggage' },
    { name: 'Passport Holder RFID', priceRange: [8, 25], category: 'travel-luggage' },
    { name: 'Laptop Bag 15 inch', priceRange: [20, 60], category: 'travel-luggage' },
    { name: 'Standing Desk Converter', priceRange: [100, 250], category: 'office-business' },
    { name: 'Ergonomic Office Chair', priceRange: [150, 400], category: 'office-business' },
    { name: 'Label Printer Thermal', priceRange: [40, 100], category: 'office-business' },
    { name: 'Document Shredder', priceRange: [30, 80], category: 'office-business' },
    { name: 'Projector 1080p', priceRange: [200, 500], category: 'office-business' },
    { name: 'Air Fryer 6L', priceRange: [50, 120], category: 'appliances' },
    { name: 'Microwave Oven 25L', priceRange: [60, 150], category: 'appliances' },
    { name: 'Robot Vacuum Mop', priceRange: [200, 500], category: 'appliances' },
    { name: 'Electric Kettle 1.7L', priceRange: [15, 45], category: 'appliances' },
    { name: 'Blender Professional', priceRange: [30, 90], category: 'appliances' },
    { name: 'Office Desk Wooden', priceRange: [120, 300], category: 'furniture' },
    { name: 'Bookshelf 5-Tier', priceRange: [40, 100], category: 'furniture' },
    { name: 'Memory Foam Mattress', priceRange: [200, 500], category: 'furniture' },
    { name: 'Dining Table 6-Seater', priceRange: [250, 600], category: 'furniture' },
    { name: 'Wardrobe 3-Door', priceRange: [180, 450], category: 'furniture' },
  ];

  const images = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572569028738-411a1974e8b5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92761a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
  ];

  let productsCreated = 0;
  let productsSkipped = 0;

  for (const template of productTemplates) {
    const category = allCategories.find(c => c.slug === template.category || c.name.toLowerCase() === template.category);
    if (!category) continue;

    const [minPrice, maxPrice] = template.priceRange;
    const basePrice = Math.round((minPrice + Math.random() * (maxPrice - minPrice)) * 100) / 100;
    const hasDiscount = Math.random() > 0.4;
    const discountPercent = hasDiscount ? Math.round(10 + Math.random() * 40) : 0;
    const originalPrice = hasDiscount ? Math.round(basePrice * (1 + discountPercent / 100) * 100) / 100 : null;
    const price = originalPrice ? Math.round(basePrice * 100) / 100 : basePrice;
    const stock = Math.round(Math.random() * 50) + 1;
    const image = images[Math.floor(Math.random() * images.length)];

    const existing = await Product.findOne({ name: template.name, category: category.name, seller: sellers[Math.floor(Math.random() * sellers.length)]._id });
    if (existing) {
      productsSkipped++;
      continue;
    }

    await Product.create({
      name: template.name,
      description: `High-quality ${template.name.toLowerCase()}. Perfect for everyday use with excellent durability and performance.`,
      price,
      originalPrice,
      image,
      category: category.name,
      stock,
      categoryRef: category._id,
      subcategoryRef: null,
      seller: sellers[Math.floor(Math.random() * sellers.length)]._id,
    });
    productsCreated++;
  }

  const totalProducts = await Product.countDocuments();
  console.log(`\n=== Product Seed Summary ===`);
  console.log(`Products created: ${productsCreated}`);
  console.log(`Products skipped (existing): ${productsSkipped}`);
  console.log(`Total products in DB: ${totalProducts}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
