const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const productFields = "name description price image category stock seller";

const getWishlist = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products",
      productFields
    );

    return res.status(200).json({
      success: true,
      data: wishlist || { user: userId, products: [] },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: product._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("products", productFields);

    return res.status(200).json({
      success: true,
      data: wishlist,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products", productFields);

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    return res.status(200).json({
      success: true,
      data: wishlist,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
