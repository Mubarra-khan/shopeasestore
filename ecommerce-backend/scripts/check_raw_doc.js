require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('products');

  const product = await collection.findOne({ _id: new mongoose.Types.ObjectId('6a8c638b2917498fabfec0ab') });
  console.log('Raw document isForSale:', product.isForSale);
  console.log('Raw document keys:', Object.keys(product).filter(k => k.includes('sale') || k === '_id'));

  await mongoose.disconnect();
}

main().catch(console.error);
