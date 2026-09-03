const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      return;
    } catch (error) {
      console.log(`[db] Existing connection ping failed: ${error.message} - reconnecting`);
      await mongoose.disconnect();
    }
  }

  return mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  }).then(() => {
    console.log("✅ MongoDB Connected");
  }).catch((error) => {
    console.log("❌ Database Connection Error:", error.message);
    throw error;
  });
};

module.exports = connectDB;
