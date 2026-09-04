const mongoose = require("mongoose");

const globalCache = global.__mongooseCache || {
  conn: null,
  promise: null,
};

global.__mongooseCache = globalCache;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (mongoose.connection.readyState === 1) {
    globalCache.conn = mongoose.connection;
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected");
        return mongooseInstance.connection;
      })
      .catch((error) => {
        globalCache.promise = null;
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
      });
  }

  const conn = await globalCache.promise;

  if (mongoose.connection.readyState === 1) {
    globalCache.conn = conn;
    return conn;
  }

  globalCache.promise = null;
  globalCache.conn = null;
  return connectDB();
};

module.exports = connectDB;
