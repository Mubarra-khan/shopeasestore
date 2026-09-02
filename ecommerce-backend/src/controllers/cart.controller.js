const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (qty > product.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [{ product: productId, quantity: qty }] });
    } else {
      const existingIndex = cart.items.findIndex((it) => it.product.toString() === productId);

      if (existingIndex > -1) {
        const existingQty = cart.items[existingIndex].quantity;
        const newQty = existingQty + qty;
        if (newQty > product.stock) {
          return res.status(400).json({ success: false, message: "Combined quantity exceeds available stock" });
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }

      await cart.save();
    }

    await cart.populate("items.product", "name price image category stock");

    const items = cart.items.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
    }));

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    return res.status(200).json({ success: true, data: { items, total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price image category stock"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ success: true, data: { items: [], total: 0 } });
    }

    const items = cart.items.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
    }));

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    return res.status(200).json({ success: true, data: { items, total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (qty > product.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((it) => it.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    await cart.populate("items.product", "name price image category stock");

    const items = cart.items.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
    }));

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    return res.status(200).json({ success: true, data: { items, total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((it) => it.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate("items.product", "name price image category stock");

    const items = cart.items.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      subtotal: it.product.price * it.quantity,
    }));

    const total = items.reduce((s, i) => s + i.subtotal, 0);

    return res.status(200).json({ success: true, data: { items, total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};
