require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start server:", error.message);
      process.exit(1);
    });
} else {
  module.exports = async (req, res) => {
    console.log(`[server] Vercel handler invoked - path: ${req.url}`);
    try {
      await connectDB();
      console.log("[server] DB connection ready, passing to Express");
      return app(req, res);
    } catch (error) {
      console.error("❌ Vercel MongoDB Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }
  };
}
