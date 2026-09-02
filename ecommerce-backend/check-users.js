require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).select('_id name email role isActive').limit(10).lean();
    console.log('Existing users:');
    users.forEach(u => console.log(` - ${u.email} (${u.role}) active=${u.isActive}`));
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}

check();
