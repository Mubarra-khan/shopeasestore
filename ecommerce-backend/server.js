
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} else {
  module.exports = (async () => {
    await connectDB();
    return app;
  })();
}
