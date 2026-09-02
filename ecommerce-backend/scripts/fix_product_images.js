const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mubarrabashir1_db_user:LVnk4BFOhzR3wCl2@cluster0.nygxxls.mongodb.net/?appName=Cluster0';

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546868871-af0de0ae72be?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1434389677669-e08b4cda3a03?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92761a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586652554267-4a9c3c81e5e3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd20f1b5f4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1585751119414-ef2636b8c79e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571175446050-ef58a70b94b3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1450778869180-41d0601e047e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1553531384-411a247ccd73?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1498041135514-ede4eaa90c53?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
];

const CATEGORY_IMAGE_MAP = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498041135514-ede4eaa90c53?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80',
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553531384-411a247ccd73?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
  ],
  'Laptops': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?auto=format&fit=crop&w=600&q=80',
  ],
  'Smartphones': [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586652554267-4a9c3c81e5e3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=600&q=80',
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92761a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
  ],
  'Beauty & Personal Care': [
    'https://images.unsplash.com/photo-1522335789203-aabd20f1b5f4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585751119414-ef2636b8c79e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571175446050-ef58a70b94b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  ],
  'watch': [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587595434101-69997a46d48a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1639037687665-4de7881c2316?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=600&q=80',
  ],
  'perfume': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585751119414-ef2636b8c79e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
  ],
};

async function main() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'ecommerce' });
    const products = await Product.find({}).lean();
    const counts = {};
    const updates = [];

    for (const product of products) {
      const cat = product.category || '';
      const pool = CATEGORY_IMAGE_MAP[cat] || IMAGE_POOL;
      const used = counts[cat] || 0;
      const image = pool[used % pool.length];
      counts[cat] = used + 1;

      if (product.image !== image) {
        updates.push(
          Product.updateOne({ _id: product._id }, { $set: { image } })
        );
      }
    }

    if (updates.length) {
      await Promise.all(updates);
      console.log(`Updated ${updates.length} products with varied images`);
    } else {
      console.log('No updates needed');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
