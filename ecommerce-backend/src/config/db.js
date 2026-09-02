const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ Database Connection Error:", error.message);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
