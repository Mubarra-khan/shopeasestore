const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (connectionPromise && mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.admin().ping();
      return connectionPromise;
    } catch (error) {
      console.log(`[db] Existing connection ping failed: ${error.message} - creating new connection`);
      connectionPromise = null;
    }
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  }).then(() => {
    console.log("✅ MongoDB Connected");
  }).catch((error) => {
    console.log("❌ Database Connection Error:", error.message);
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
};

module.exports = connectDB;
