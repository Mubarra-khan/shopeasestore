const mongoose = require("mongoose");

const connectDB = async () => {
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
