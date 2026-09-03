const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      return;
    } catch (error) {
      console.log(`[db] Existing connection ping failed: ${error.message} - reconnecting`);
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.log(`[db] Disconnect error: ${e.message}`);
      }
    }
  }

  try {
    return await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then(() => {
      console.log("✅ MongoDB Connected");
    });
  } catch (error) {
    console.log(`[db] First connection attempt failed: ${error.message} - retrying once`);
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.log(`[db] Retry disconnect error: ${e.message}`);
    }
    return mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then(() => {
      console.log("✅ MongoDB Connected on retry");
    }).catch((retryError) => {
      console.log("❌ Database Connection Error:", retryError.message);
      throw retryError;
    });
  }
};

module.exports = connectDB;
