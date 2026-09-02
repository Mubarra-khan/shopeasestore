const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart.controller");

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.put("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeCartItem);

module.exports = router;
