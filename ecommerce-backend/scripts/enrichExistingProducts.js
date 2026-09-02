require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

function inferBrand(name) {
  const brands = [
    'Acer', 'Lenovo', 'ASUS', 'HP', 'Dell', 'Microsoft', 'Apple', 'MacBook', 'iPhone',
    'MSI', 'Samsung', 'Google', 'Pixel', 'OnePlus', 'Sony', 'Nothing', 'Motorola',
    'Xiaomi', 'Nokia', 'Logitech', 'Keychron', 'Anker', 'JBL', 'Ergotron', 'Framework',
    'ARKON', 'Corelle', 'Nike', 'Adidas', 'Puma', 'Reebok', 'Gucci', 'Zara',
    'H&M', 'Uniqlo', 'Levi\'s', 'Calvin Klein', 'Ralph Lauren', 'Under Armour',
    'Canon', 'Nikon', 'Bose', 'Beats', 'Sennheiser', 'Audio-Technica', 'Shure',
    'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'BenQ', 'LG', 'Panasonic', 'Philips',
    'Toshiba', 'Fujitsu', 'Chuwi', 'Infinix', 'Tecno', 'Realme', 'Honor', 'OPPO', 'Vivo'
  ];
  const upper = name || '';
  for (const brand of brands) {
    if (upper.includes(brand)) return brand;
  }
  return '';
}

function inferSpecs(product) {
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const specs = {};

  if (['laptops', 'smartphones', 'electronics', 'accessories'].some((c) => category.includes(c))) {
    specs.brand = inferBrand(product.name) || 'Generic';
    specs.color = ['Black', 'Silver', 'Grey', 'Blue', 'White'][Math.floor(Math.random() * 5)];
    specs.material = ['Aluminum', 'Plastic', 'Metal', 'Glass'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Lahore', 'Karachi', 'Islamabad'][Math.floor(Math.random() * 3)];
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a cool, dry place';
  } else if (category.includes('fashion') || category.includes('watch') || category.includes('perfume')) {
    specs.brand = inferBrand(product.name) || ['Generic', 'Unbranded', 'Fashion Hub'][Math.floor(Math.random() * 3)];
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Multicolor'];
    specs.color = product.name.toLowerCase().includes('men') || product.name.toLowerCase().includes('women')
      ? ['Black', 'White', 'Red', 'Blue', 'Brown'][Math.floor(Math.random() * 5)]
      : colors[Math.floor(Math.random() * colors.length)];
    const materials = ['Cotton', 'Polyester', 'Leather', 'Denim', 'Silk', 'Nylon', 'Metal'];
    specs.material = materials[Math.floor(Math.random() * materials.length)];
    specs.age = name.includes('kids') || name.includes('children') ? 'Kids' : 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = ['Available', 'Limited Offer'][Math.floor(Math.random() * 2)];
    specs.deliveryFrom = ['Lahore', 'Karachi', 'Islamabad', 'Punjab'][Math.floor(Math.random() * 4)];
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '3 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('beauty')) {
    specs.brand = 'Generic';
    specs.color = ['White', 'Pink', 'Red', 'Blue', 'Natural'][Math.floor(Math.random() * 5)];
    specs.material = ['Plastic', 'Glass', 'Cream', 'Liquid', 'Gel'][Math.floor(Math.random() * 5)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Islamabad', 'Lahore', 'Karachi'][Math.floor(Math.random() * 3)];
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a cool, dry place';
  } else if (category.includes('health')) {
    specs.brand = 'Generic';
    specs.color = ['White', 'Blue', 'Green', 'Grey'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Stainless Steel', 'Fabric', 'Foam'][Math.floor(Math.random() * 4)];
    specs.age = name.includes('kids') || name.includes('baby') ? 'Kids' : 'Adult';
    specs.service = 'Premium Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Lahore', 'Karachi', 'Punjab'][Math.floor(Math.random() * 3)];
    specs.warrantyType = 'Brand Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('kitchen') || category.includes('home')) {
    specs.brand = ['Generic', 'ARKON', 'Corelle', 'KitchenAid'][Math.floor(Math.random() * 4)];
    specs.color = ['White', 'Black', 'Silver', 'Stainless Steel', 'Multicolor'][Math.floor(Math.random() * 5)];
    const materials = ['Ceramic', 'Melamine', 'Stainless Steel', 'Plastic', 'Bamboo', 'Glass', 'Wood'];
    specs.material = materials[Math.floor(Math.random() * materials.length)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = ['Available', 'Limited Offer'][Math.floor(Math.random() * 2)];
    specs.deliveryFrom = ['Punjab', 'Sindh', 'Lahore'][Math.floor(Math.random() * 3)];
    specs.warrantyType = ['Seller Warranty', 'Brand Warranty'][Math.floor(Math.random() * 2)];
    specs.warrantyPeriod = ['6 Months', '1 Year'][Math.floor(Math.random() * 2)];
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('groceries')) {
    specs.brand = ['Generic', 'Local Farm', 'Organic Store'][Math.floor(Math.random() * 3)];
    specs.color = '';
    specs.material = '';
    specs.age = 'Adult';
    specs.service = 'Standard Delivery';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '3 Months';
    specs.storageRequirement = 'Store in a cool, dry place';
  } else if (category.includes('sports') || category.includes('fitness')) {
    specs.brand = ['Generic', 'Nike', 'Adidas', 'Puma'][Math.floor(Math.random() * 4)];
    specs.color = ['Black', 'Blue', 'Red', 'Green', 'Yellow'][Math.floor(Math.random() * 5)];
    specs.material = ['Rubber', 'Plastic', 'Metal', 'Fabric', 'Nylon'][Math.floor(Math.random() * 5)];
    specs.age = name.includes('kids') || name.includes('children') ? 'Kids' : 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Karachi', 'Lahore', 'Islamabad'][Math.floor(Math.random() * 3)];
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('automotive')) {
    specs.brand = 'Generic';
    specs.color = ['Black', 'Red', 'White', 'Silver'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Metal', 'Rubber', 'Carbon Fiber'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Sindh';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('books') || category.includes('stationery')) {
    specs.brand = 'Generic';
    specs.color = ['White', 'Black', 'Blue', 'Assorted'][Math.floor(Math.random() * 4)];
    specs.material = ['Paper', 'Plastic', 'Cardboard', 'Ink'][Math.floor(Math.random() * 4)];
    specs.age = name.includes('kids') || name.includes('children') ? 'Kids' : 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'No Promotion';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '3 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('toys') || category.includes('games')) {
    specs.brand = 'Generic';
    specs.color = ['Multicolor', 'Red', 'Blue', 'Yellow', 'Green'][Math.floor(Math.random() * 5)];
    specs.material = ['Plastic', 'Wood', 'Fabric', 'Cardboard'][Math.floor(Math.random() * 4)];
    specs.age = 'Kids';
    specs.service = 'Standard Service';
    specs.promotion = 'Limited Offer';
    specs.deliveryFrom = ['Sindh', 'Punjab'][Math.floor(Math.random() * 2)];
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '3 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('baby') || category.includes('kids')) {
    specs.brand = ['Generic', 'BabyCare', 'KidsJoy'][Math.floor(Math.random() * 3)];
    specs.color = ['Pink', 'Blue', 'White', 'Yellow', 'Multicolor'][Math.floor(Math.random() * 5)];
    specs.material = ['Cotton', 'Plastic', 'Wood', 'Silicone'][Math.floor(Math.random() * 4)];
    specs.age = 'Kids';
    specs.service = 'Premium Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Lahore', 'Karachi', 'Islamabad'][Math.floor(Math.random() * 3)];
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('jewelry')) {
    specs.brand = ['Generic', 'SilverLine', 'GoldMark'][Math.floor(Math.random() * 3)];
    specs.color = ['Silver', 'Gold', 'Black', 'Rose Gold'][Math.floor(Math.random() * 4)];
    specs.material = ['Stainless Steel', 'Gold Plated', 'Silver', 'Leather'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('tools') || category.includes('hardware')) {
    specs.brand = ['Generic', 'DeWalt', 'Bosch', 'Makita'][Math.floor(Math.random() * 4)];
    specs.color = ['Black', 'Silver', 'Yellow', 'Red'][Math.floor(Math.random() * 4)];
    specs.material = ['Metal', 'Plastic', 'Rubber', 'Steel'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'No Promotion';
    specs.deliveryFrom = ['Sindh', 'Punjab'][Math.floor(Math.random() * 2)];
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('garden') || category.includes('outdoor')) {
    specs.brand = 'Generic';
    specs.color = ['Green', 'Brown', 'Black', 'Multicolor'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Metal', 'Ceramic', 'Fabric', 'Wood'][Math.floor(Math.random() * 5)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '6 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('pet')) {
    specs.brand = 'Generic';
    specs.color = ['Brown', 'White', 'Blue', 'Assorted'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Fabric', 'Steel', 'Nylon'][Math.floor(Math.random() * 4)];
    specs.age = 'All Ages';
    specs.service = 'Standard Service';
    specs.promotion = 'Limited Offer';
    specs.deliveryFrom = ['Karachi', 'Lahore'][Math.floor(Math.random() * 2)];
    specs.warrantyType = 'No Warranty';
    specs.warrantyPeriod = '3 Months';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('travel') || category.includes('luggage')) {
    specs.brand = ['Generic', 'Samsonite', 'Travelpro'][Math.floor(Math.random() * 3)];
    specs.color = ['Black', 'Silver', 'Blue', 'Grey'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Leather', 'Memory Foam', 'Nylon'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('office') || category.includes('business')) {
    specs.brand = 'Generic';
    specs.color = ['Black', 'White', 'Grey', 'Blue'][Math.floor(Math.random() * 4)];
    specs.material = ['Plastic', 'Metal', 'Paper', 'Fabric'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Premium Service';
    specs.promotion = 'No Promotion';
    specs.deliveryFrom = 'Islamabad';
    specs.warrantyType = 'Brand Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('appliances')) {
    specs.brand = ['Generic', 'Philips', 'Panasonic', 'Samsung'][Math.floor(Math.random() * 4)];
    specs.color = ['Black', 'Silver', 'White'][Math.floor(Math.random() * 3)];
    specs.material = ['Plastic', 'Metal', 'Glass'][Math.floor(Math.random() * 3)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Limited Offer';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else if (category.includes('furniture')) {
    specs.brand = 'Generic';
    specs.color = ['Brown', 'Black', 'White', 'Grey', 'Natural'][Math.floor(Math.random() * 5)];
    specs.material = ['Wood', 'Metal', 'Fabric', 'Foam', 'MDF'][Math.floor(Math.random() * 5)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = 'Punjab';
    specs.warrantyType = 'Seller Warranty';
    specs.warrantyPeriod = '1 Year';
    specs.storageRequirement = 'Store in a dry place';
  } else {
    specs.brand = 'Generic';
    specs.color = ['Assorted', 'Multicolor', 'Black', 'White'][Math.floor(Math.random() * 4)];
    specs.material = ['Mixed', 'Plastic', 'Paper', 'Fabric'][Math.floor(Math.random() * 4)];
    specs.age = 'Adult';
    specs.service = 'Standard Service';
    specs.promotion = 'Available';
    specs.deliveryFrom = ['Lahore', 'Karachi', 'Islamabad', 'Punjab', 'Sindh'][Math.floor(Math.random() * 5)];
    specs.warrantyType = ['No Warranty', 'Seller Warranty'][Math.floor(Math.random() * 2)];
    specs.warrantyPeriod = ['3 Months', '6 Months'][Math.floor(Math.random() * 2)];
    specs.storageRequirement = 'Store in a dry place';
  }

  return specs;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({});
  console.log('Total products inspected:', products.length);

  const fields = ['brand', 'color', 'material', 'age', 'service', 'promotion', 'deliveryFrom', 'warrantyType', 'warrantyPeriod', 'storageRequirement'];
  const updateCounts = {};
  fields.forEach((f) => { updateCounts[f] = 0; });

  const modifiedIds = [];
  const unchangedIds = [];

  for (const product of products) {
    const existing = {};
    fields.forEach((f) => {
      existing[f] = product[f] && String(product[f]).trim();
    });

    const hasAny = Object.values(existing).some(Boolean);
    if (!hasAny) {
      const inferred = inferSpecs(product);
      const update = {};
      fields.forEach((f) => {
        if (!existing[f] && inferred[f]) {
          update[f] = inferred[f];
          updateCounts[f]++;
        }
      });
      if (Object.keys(update).length > 0) {
        await Product.findByIdAndUpdate(product._id, { $set: update });
        modifiedIds.push({ id: product._id.toString(), name: product.name, update });
      } else {
        unchangedIds.push(product._id.toString());
      }
    } else {
      unchangedIds.push(product._id.toString());
    }
  }

  console.log('Update counts per field:', updateCounts);
  console.log('Products modified:', modifiedIds.length);
  console.log('Products unchanged:', unchangedIds.length);

  await mongoose.disconnect();
  console.log('Disconnected.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
