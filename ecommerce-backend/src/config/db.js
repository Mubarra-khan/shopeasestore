const mongoose = require("mongoose");

let connectionPromise = null;
let isConnecting = false;

const connectDB = async () => {
  const readyState = mongoose.connection.readyState;
  console.log(`[db] connectDB start - readyState: ${readyState}`);

  if (readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      console.log("[db] Existing connection healthy");
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

  if (isConnecting) {
    console.log("[db] Connection already in progress, awaiting existing promise");
    return connectionPromise;
  }

  isConnecting = true;
  console.log(`[db] Initiating new connection - MONGO_URI present: ${!!process.env.MONGO_URI}`);

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 1,
    })
    .then(() => {
      console.log("✅ MongoDB Connected");
      console.log(`[db] Final readyState: ${mongoose.connection.readyState}`);
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("❌ MongoDB Connection Error:", error.message);
      throw error;
    })
    .finally(() => {
      isConnecting = false;
    });

  return connectionPromise;
};

module.exports = connectDB;
