require('dotenv').config();
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

async function main() {
  await connectDB();
  
  const product = await Product.findById('6a85e788028e828e9c83706d');
  if (product) {
    console.log('Product found:', product.name, 'Stock:', product.stock);
    product.stock = 10;
    await product.save();
    console.log('Stock updated to 10');
  } else {
    console.log('Product not found');
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
