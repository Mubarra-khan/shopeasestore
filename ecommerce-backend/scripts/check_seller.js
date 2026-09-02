require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');

(async () => {
  try {
    await connectDB();
    const sellers = await User.find({ role: 'seller' }).select('name email role').limit(10).lean();
    console.log(JSON.stringify(sellers, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
