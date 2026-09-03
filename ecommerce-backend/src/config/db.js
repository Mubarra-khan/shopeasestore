const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (!connectionPromise) {
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
  }

  return connectionPromise;
};

module.exports = connectDB;
