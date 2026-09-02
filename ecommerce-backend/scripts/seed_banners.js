require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('../src/models/Banner');

const demoBanners = [
  {
    title: 'Weekend Sale',
    subtitle: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Shop Now',
    link: '/products',
    category: '',
    isActive: true,
    sortOrder: 1,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Electronics Deals',
    subtitle: 'Latest Electronics at Great Prices',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Explore Electronics',
    link: '/products?category=electronics',
    category: 'electronics',
    isActive: true,
    sortOrder: 2,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Fashion Sale',
    subtitle: 'New Season Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Shop Fashion',
    link: '/products?category=fashion',
    category: 'fashion',
    isActive: true,
    sortOrder: 3,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Home & Kitchen',
    subtitle: 'Upgrade Your Home',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Discover More',
    link: '/products?category=home-kitchen',
    category: 'home-kitchen',
    isActive: true,
    sortOrder: 4,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Beauty Deals',
    subtitle: 'Beauty Essentials',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd20f1b5f4?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Shop Beauty',
    link: '/products?category=beauty-personal-care',
    category: 'beauty-personal-care',
    isActive: true,
    sortOrder: 5,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Sports & Fitness',
    subtitle: 'Gear Up & Get Active',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Explore Sports',
    link: '/products?category=sports-fitness',
    category: 'sports-fitness',
    isActive: true,
    sortOrder: 6,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Free Shipping',
    subtitle: 'Shop More, Save More',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Learn More',
    link: '/products',
    category: '',
    isActive: true,
    sortOrder: 7,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Sell on ShopEase',
    subtitle: 'Start Selling Today',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e4?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Get Started',
    link: '/become-seller',
    category: '',
    isActive: true,
    sortOrder: 8,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    let created = 0;
    let existing = 0;

    for (const banner of demoBanners) {
      const exists = await Banner.findOne({ sortOrder: banner.sortOrder });
      if (exists) {
        existing++;
        console.log(`  Existing banner sortOrder=${banner.sortOrder}: ${banner.title}`);
      } else {
        await Banner.create(banner);
        created++;
        console.log(`  Created banner sortOrder=${banner.sortOrder}: ${banner.title}`);
      }
    }

    console.log('\n=== Banner Seed Summary ===');
    console.log(`Banners existing: ${existing}`);
    console.log(`Banners created: ${created}`);
    console.log('Seed completed successfully.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
