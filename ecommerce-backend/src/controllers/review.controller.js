const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

const userFields = "name";

const validateProductId = (productId) => mongoose.Types.ObjectId.isValid(productId);

const validateRating = (rating) =>
  typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5;

const validateComment = (comment) =>
  typeof comment === "string" && comment.trim().length > 0;

const getProductOrRespond = async (productId, res) => {
  if (!validateProductId(productId)) {
    res.status(400).json({ success: false, message: "Invalid product ID" });
    return null;
  }

  const product = await Product.findById(productId).select("_id");
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return null;
  }

  return product;
};

const canUserReviewOrderItem = async (userId, orderItemId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(orderItemId)) {
    return { eligible: false, reason: "Invalid request" };
  }

  const order = await Order.findOne({
    user: userId,
    status: "delivered",
    "items._id": orderItemId,
  }).select("_id status paymentStatus");

  if (!order) {
    return { eligible: false, reason: "You can only review products from delivered orders you own." };
  }

  const existingReview = await Review.findOne({ user: userId, orderItem: orderItemId });
  if (existingReview) {
    return { eligible: false, reason: "You have already reviewed this purchase." };
  }

  return { eligible: true };
};

const canUserReviewProduct = async (userId, productId) => {
  if (!userId || !validateProductId(productId)) {
    return { eligible: false, reason: "Invalid request" };
  }

  const deliveredOrder = await Order.findOne({
    user: userId,
    status: "delivered",
    "items.product": productId,
  }).select("_id status paymentStatus");

  if (!deliveredOrder) {
    return { eligible: false, reason: "You can only review products you have purchased and received." };
  }

  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    return { eligible: false, reason: "You have already reviewed this product." };
  }

  return { eligible: true };
};

const getReviewEligibility = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;
    const { orderId, orderItemId } = req.query || {};

    if (!userId) {
      return res.status(200).json({
        success: true,
        data: {
          eligible: false,
          reason: "Please login to review this product.",
        },
      });
    }

    if (!validateProductId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let eligibility;
    if (orderItemId) {
      eligibility = await canUserReviewOrderItem(userId, orderItemId);
    } else if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: userId, status: "delivered" });
      if (!order) {
        eligibility = { eligible: false, reason: "Order not found or not delivered." };
      } else {
        const orderItem = order.items.find((item) => item.product.toString() === productId);
        if (!orderItem) {
          eligibility = { eligible: false, reason: "Product not found in this order." };
        } else {
          eligibility = await canUserReviewOrderItem(userId, orderItem._id.toString());
        }
      }
    } else {
      eligibility = await canUserReviewProduct(userId, product._id.toString());
    }

    return res.status(200).json({
      success: true,
      data: eligibility,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await getProductOrRespond(productId, res);

    if (!product) {
      return;
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", userFields)
      .sort({ createdAt: -1 });

    const summary = reviews.reduce(
      (result, review) => {
        result.reviewCount += 1;
        result.averageRating += review.rating;
        return result;
      },
      { averageRating: 0, reviewCount: 0 }
    );

    if (summary.reviewCount > 0) {
      summary.averageRating = Number(
        (summary.averageRating / summary.reviewCount).toFixed(2)
      );
    }

    return res.status(200).json({
      success: true,
      data: { reviews, summary },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;
    const { rating, comment, orderId, orderItemId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const product = await getProductOrRespond(productId, res);
    if (!product) {
      return;
    }
    if (!validateRating(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer from 1 to 5",
      });
    }
    if (!validateComment(comment)) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    let finalOrderItemId = orderItemId;
    let finalOrderId = orderId;

    if (finalOrderItemId) {
      const eligibility = await canUserReviewOrderItem(userId, finalOrderItemId);
      if (!eligibility.eligible) {
        return res.status(403).json({
          success: false,
          message: eligibility.reason,
        });
      }

      const order = await Order.findOne({ "items._id": finalOrderItemId }).select("_id user status");
      if (!order || order.user.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: order does not belong to you" });
      }
      finalOrderId = order._id.toString();
    } else {
      const eligibility = await canUserReviewProduct(userId, product._id.toString());
      if (!eligibility.eligible) {
        return res.status(403).json({
          success: false,
          message: eligibility.reason,
        });
      }
    }

    try {
      const review = await Review.create({
        user: userId,
        product: product._id,
        order: finalOrderId || null,
        orderItem: finalOrderItemId || null,
        rating,
        comment: comment.trim(),
      });

      await review.populate("user", userFields);

      if (finalOrderItemId) {
        try {
          await Notification.deleteMany({
            user: userId,
            type: "review_prompt",
            orderItem: finalOrderItemId,
          });
        } catch {
          // ignore notification cleanup errors
        }
      }

      return res.status(201).json({
        success: true,
        data: review,
        message: "Review created successfully",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this product",
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const findOwnedReview = async (reviewId, productId, userId, res) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400).json({ success: false, message: "Invalid review ID" });
    return null;
  }

  const review = await Review.findOne({
    _id: reviewId,
    product: productId,
    user: userId,
  });

  if (review) {
    return review;
  }

  const existingReview = await Review.findById(reviewId).select("_id product");
  if (existingReview) {
    res.status(403).json({
      success: false,
      message: "Forbidden: you do not own this review",
    });
  } else {
    res.status(404).json({ success: false, message: "Review not found" });
  }

  return null;
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const product = await getProductOrRespond(productId, res);
    if (!product) {
      return;
    }
    const review = await findOwnedReview(reviewId, productId, userId, res);
    if (!review) {
      return;
    }

    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Rating or review comment is required",
      });
    }
    if (rating !== undefined && !validateRating(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer from 1 to 5",
      });
    }
    if (comment !== undefined && !validateComment(comment)) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();
    await review.save();
    await review.populate("user", userFields);

    return res.status(200).json({
      success: true,
      data: review,
      message: "Review updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId, reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const product = await getProductOrRespond(productId, res);
    if (!product) {
      return;
    }
    const review = await findOwnedReview(reviewId, productId, userId, res);
    if (!review) {
      return;
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReviews,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  canUserReviewProduct,
};
