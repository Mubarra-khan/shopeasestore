require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Subcategory = require('../src/models/Subcategory');

const normalizeSlug = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const categoryData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Mobile phones, laptops, gadgets, and electronic devices',
    subcategories: [
      'Mobile Phones',
      'Mobile Accessories',
      'Tablets',
      'Laptops',
      'Desktop Computers',
      'Computer Components',
      'Monitors',
      'Printers & Scanners',
      'Networking',
      'Storage Devices',
      'Cameras',
      'Camera Accessories',
      'Headphones & Earphones',
      'Speakers',
      'TVs',
      'TV Accessories',
      'Gaming',
      'Gaming Consoles',
      'Gaming Accessories',
      'Smart Watches',
      'Smart Home',
      'Power Banks',
      'Chargers & Cables',
      'Electronic Accessories',
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, bags, and fashion accessories',
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids' Clothing",
      "Boys' Clothing",
      "Girls' Clothing",
      "Men's Shoes",
      "Women's Shoes",
      "Kids' Shoes",
      'Bags',
      'Backpacks',
      'Wallets',
      'Belts',
      'Hats & Caps',
      'Scarves',
      'Socks',
      'Innerwear',
      'Watches',
      'Fashion Accessories',
      'Sunglasses',
      'Jewelry',
    ],
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Makeup, skincare, hair care, and personal grooming',
    subcategories: [
      'Makeup',
      'Skincare',
      'Hair Care',
      'Fragrances',
      'Men\'s Grooming',
      'Bath & Body',
      'Oral Care',
      'Beauty Tools',
      'Nail Care',
      'Personal Hygiene',
      'Hair Styling Tools',
    ],
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Vitamins, medical supplies, fitness, and healthcare devices',
    subcategories: [
      'Vitamins & Supplements',
      'Medical Supplies',
      'Fitness & Wellness',
      'Personal Care',
      'First Aid',
      'Health Monitoring',
      'Mobility & Support',
      'Healthcare Devices',
    ],
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, decor, kitchenware, and home essentials',
    subcategories: [
      'Furniture',
      'Home Decor',
      'Kitchen & Dining',
      'Kitchen Appliances',
      'Cookware',
      'Bakeware',
      'Storage & Organization',
      'Cleaning Supplies',
      'Bedding',
      'Bath',
      'Lighting',
      'Curtains & Blinds',
      'Home Improvement',
      'Household Supplies',
    ],
  },
  {
    name: 'Groceries',
    slug: 'groceries',
    description: 'Fresh food, beverages, snacks, and cooking essentials',
    subcategories: [
      'Fresh Food',
      'Packaged Food',
      'Beverages',
      'Snacks',
      'Breakfast Foods',
      'Cooking Essentials',
      'Baking Ingredients',
      'Canned & Preserved Food',
      'International Foods',
      'Baby Food',
      'Household Groceries',
    ],
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Exercise equipment, sportswear, and outdoor gear',
    subcategories: [
      'Exercise Equipment',
      'Fitness Accessories',
      'Running',
      'Cycling',
      'Outdoor Sports',
      'Team Sports',
      'Football',
      'Cricket',
      'Basketball',
      'Tennis',
      'Swimming',
      'Yoga',
      'Camping & Hiking',
      'Sportswear',
      'Sports Shoes',
    ],
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car and motorcycle accessories, care products, and parts',
    subcategories: [
      'Car Accessories',
      'Motorcycle Accessories',
      'Car Electronics',
      'Tires & Wheels',
      'Car Care',
      'Tools & Equipment',
      'Interior Accessories',
      'Exterior Accessories',
      'Replacement Parts',
      'Oils & Fluids',
      'Safety & Emergency',
    ],
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Books, office supplies, school supplies, and art materials',
    subcategories: [
      'Books',
      'Educational Books',
      'Fiction',
      'Non-Fiction',
      'Children\'s Books',
      'Office Supplies',
      'School Supplies',
      'Writing Supplies',
      'Art Supplies',
      'Notebooks',
      'Planners',
      'Printing Supplies',
    ],
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Educational toys, baby toys, board games, and video games',
    subcategories: [
      'Educational Toys',
      'Baby Toys',
      'Kids Toys',
      'Dolls',
      'Action Figures',
      'Building Toys',
      'Remote Control Toys',
      'Board Games',
      'Card Games',
      'Puzzles',
      'Outdoor Toys',
      'Video Games',
    ],
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Baby clothing, gear, feeding, and nursery essentials',
    subcategories: [
      'Baby Clothing',
      'Baby Shoes',
      'Diapers',
      'Baby Feeding',
      'Baby Care',
      'Baby Gear',
      'Strollers',
      'Car Seats',
      'Nursery',
      'Kids Accessories',
      'Kids Furniture',
    ],
  },
  {
    name: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    description: 'Fine jewelry, fashion jewelry, and accessories',
    subcategories: [
      'Fine Jewelry',
      'Fashion Jewelry',
      'Rings',
      'Necklaces',
      'Earrings',
      'Bracelets',
      'Anklets',
      'Jewelry Sets',
      'Watches',
      'Jewelry Storage',
    ],
  },
  {
    name: 'Tools & Hardware',
    slug: 'tools-hardware',
    description: 'Hand tools, power tools, hardware, and building materials',
    subcategories: [
      'Hand Tools',
      'Power Tools',
      'Tool Sets',
      'Hardware',
      'Electrical Supplies',
      'Plumbing Supplies',
      'Safety Equipment',
      'Measuring Tools',
      'Workshop Equipment',
      'Building Materials',
    ],
  },
  {
    name: 'Garden & Outdoor',
    slug: 'garden-outdoor',
    description: 'Gardening tools, plants, outdoor furniture, and BBQ',
    subcategories: [
      'Gardening Tools',
      'Plants & Seeds',
      'Pots & Planters',
      'Garden Furniture',
      'Outdoor Lighting',
      'Outdoor Storage',
      'Lawn Care',
      'BBQ & Outdoor Cooking',
      'Outdoor Decor',
    ],
  },
  {
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Food, grooming, toys, and accessories for pets',
    subcategories: [
      'Dog Supplies',
      'Cat Supplies',
      'Bird Supplies',
      'Fish Supplies',
      'Small Animal Supplies',
      'Pet Food',
      'Pet Grooming',
      'Pet Toys',
      'Pet Beds',
      'Pet Accessories',
    ],
  },
  {
    name: 'Travel & Luggage',
    slug: 'travel-luggage',
    description: 'Suitcases, travel bags, and travel accessories',
    subcategories: [
      'Suitcases',
      'Travel Bags',
      'Backpacks',
      'Laptop Bags',
      'Travel Accessories',
      'Travel Organizers',
      'Passport Holders',
      'Travel Security',
      'Camping Luggage',
    ],
  },
  {
    name: 'Office & Business',
    slug: 'office-business',
    description: 'Office furniture, electronics, supplies, and equipment',
    subcategories: [
      'Office Furniture',
      'Office Electronics',
      'Office Supplies',
      'Printers',
      'Paper Products',
      'Storage',
      'Presentation Equipment',
      'Business Equipment',
      'Security Equipment',
    ],
  },
  {
    name: 'Appliances',
    slug: 'appliances',
    description: 'Refrigerators, washing machines, ACs, and home appliances',
    subcategories: [
      'Refrigerators',
      'Freezers',
      'Washing Machines',
      'Dryers',
      'Air Conditioners',
      'Fans',
      'Heaters',
      'Vacuum Cleaners',
      'Microwave Ovens',
      'Ovens',
      'Small Kitchen Appliances',
    ],
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Bedroom, living room, dining, and outdoor furniture',
    subcategories: [
      'Bedroom Furniture',
      'Living Room Furniture',
      'Dining Furniture',
      'Office Furniture',
      'Outdoor Furniture',
      'Storage Furniture',
      'Kids Furniture',
      'Mattresses',
      'Chairs',
      'Tables',
      'Sofas',
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    let categoriesCreated = 0;
    let categoriesExisting = 0;
    let subcategoriesCreated = 0;
    let subcategoriesExisting = 0;

    for (const cat of categoryData) {
      let category = await Category.findOne({ slug: cat.slug });
      if (!category) {
        category = await Category.create({
          name: cat.name.trim(),
          slug: cat.slug,
          description: cat.description || '',
          isActive: true,
        });
        categoriesCreated++;
      } else {
        categoriesExisting++;
      }

      for (const subName of cat.subcategories) {
        const subSlug = normalizeSlug(subName);
        let subcategory = await Subcategory.findOne({
          category: category._id,
          slug: subSlug,
        });

        if (!subcategory) {
          subcategory = await Subcategory.create({
            name: subName.trim(),
            slug: subSlug,
            category: category._id,
            isActive: true,
          });
          subcategoriesCreated++;
        } else {
          subcategoriesExisting++;
        }
      }
    }

    console.log('\n=== Seed Summary ===');
    console.log(`Categories existing: ${categoriesExisting}`);
    console.log(`Categories created: ${categoriesCreated}`);
    console.log(`Subcategories existing: ${subcategoriesExisting}`);
    console.log(`Subcategories created: ${subcategoriesCreated}`);
    console.log('Seed completed successfully.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
