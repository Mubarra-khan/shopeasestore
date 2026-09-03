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

  let retries = 3;
  while (retries > 0) {
    try {
      return await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }).then(() => {
        console.log("✅ MongoDB Connected");
      });
    } catch (error) {
      retries--;
      console.log(`[db] Connection attempt failed: ${error.message} - retries left: ${retries}`);
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          await mongoose.disconnect();
        } catch (e) {
          console.log(`[db] Retry disconnect error: ${e.message}`);
        }
      } else {
        console.log("❌ Database Connection Error:", error.message);
        throw error;
      }
    }
  }
};

module.exports = connectDB;
