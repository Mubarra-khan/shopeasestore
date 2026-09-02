const express = require("express");
const cors = require("cors");
const path = require("path");
const { handleStripeWebhook } = require("./controllers/stripe.controller");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
];

const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
  allowedOrigins.push(frontendUrl);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post(
	"/api/webhooks/stripe",
	express.raw({ type: "application/json" }),
	handleStripeWebhook
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use(
	"/api/products/:productId/reviews",
	require("./routes/review.routes")
);
app.use("/api/properties", require("./routes/property.routes"));
app.use("/api/rentals", require("./routes/rental.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/returns", require("./routes/return.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/support", require("./routes/support.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api", require("./routes/category.routes"));
app.use("/api", require("./routes/banner.routes"));
app.use("/api", require("./routes/suggestion.routes"));

module.exports = app;