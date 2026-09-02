const mongoose = require("mongoose");
const Return = require("../models/Return");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Stripe = require("stripe");

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const createReturn = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { orderId, reason } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!orderId || !reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: "Order ID and return reason are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden: you do not own this order" });
    }

    if (!["delivered"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Only delivered orders can be returned" });
    }

    const existingReturn = await Return.findOne({ order: orderId, status: { $ne: "rejected" } });
    if (existingReturn) {
      return res.status(409).json({ success: false, message: "A return request already exists for this order" });
    }

    const returnRequest = await Return.create({
      order: orderId,
      user: userId,
      reason: String(reason).trim(),
      status: "pending",
      refundStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      data: returnRequest,
      message: "Return request submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReturns = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;

    let filter = {};
    if (role === "admin") {
      filter = {};
    } else if (role === "seller") {
      const sellerProducts = await Product.find({ seller: userId }).select("_id");
      const sellerProductIds = sellerProducts.map((product) => product._id.toString());
      const sellerOrders = await Order.find({ "items.product": { $in: sellerProductIds } }).select("_id");
      const sellerOrderIds = sellerOrders.map((order) => order._id);
      filter = { order: { $in: sellerOrderIds } };
    } else {
      filter = { user: userId };
    }

    const returns = await Return.find(filter)
      .populate("order", "status paymentStatus totalAmount")
      .populate("user", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: returns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user;
    const role = req.user && req.user.role;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (returnRequest.status !== "pending") {
      return res.status(400).json({ success: false, message: `Return is already ${returnRequest.status}` });
    }

    if (role === "seller") {
      const order = await Order.findById(returnRequest.order);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      const sellerProductIds = new Set(
        (await Product.find({ seller: adminId }).select("_id")).map((product) => product._id.toString())
      );
      const hasSellerItem = order.items.some((item) => sellerProductIds.has(item.product.toString()));
      if (!hasSellerItem) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: return does not involve your products",
        });
      }
    }

    returnRequest.status = "approved";
    returnRequest.reviewedBy = adminId;
    returnRequest.reviewedAt = new Date();
    await returnRequest.save();

    return res.status(200).json({
      success: true,
      data: returnRequest,
      message: "Return approved successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user;
    const role = req.user && req.user.role;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (returnRequest.status !== "pending") {
      return res.status(400).json({ success: false, message: `Return is already ${returnRequest.status}` });
    }

    if (role === "seller") {
      const order = await Order.findById(returnRequest.order);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      const sellerProductIds = new Set(
        (await Product.find({ seller: adminId }).select("_id")).map((product) => product._id.toString())
      );
      const hasSellerItem = order.items.some((item) => sellerProductIds.has(item.product.toString()));
      if (!hasSellerItem) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: return does not involve your products",
        });
      }
    }

    returnRequest.status = "rejected";
    returnRequest.reviewedBy = adminId;
    returnRequest.reviewedAt = new Date();
    await returnRequest.save();

    return res.status(200).json({
      success: true,
      data: returnRequest,
      message: "Return rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const refundReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user;
    const { refundStatus } = req.body || {};
    const role = req.user && req.user.role;

    if (!["completed", "failed"].includes(refundStatus)) {
      return res.status(400).json({ success: false, message: "refundStatus must be completed or failed" });
    }

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (returnRequest.status !== "approved") {
      return res.status(400).json({ success: false, message: "Return must be approved before refund" });
    }

    if (returnRequest.refundStatus === "completed") {
      return res.status(400).json({ success: false, message: "Return has already been refunded" });
    }

    const order = await Order.findById(returnRequest.order);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (role === "seller") {
      const sellerProductIds = new Set(
        (await Product.find({ seller: adminId }).select("_id")).map((product) => product._id.toString())
      );
      const hasSellerItem = order.items.some((item) => sellerProductIds.has(item.product.toString()));
      if (!hasSellerItem) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: return does not involve your products",
        });
      }
    }

    if (order.paymentMethod === "cod") {
      if (refundStatus === "completed") {
        returnRequest.status = "refunded";
      }
      returnRequest.refundStatus = refundStatus;
      returnRequest.reviewedBy = adminId;
      returnRequest.reviewedAt = new Date();
      await returnRequest.save();

      return res.status(200).json({
        success: true,
        data: returnRequest,
        message: `COD return marked as ${refundStatus}`,
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Order is not paid, cannot refund" });
    }

    if (!order.stripePaymentIntentId) {
      return res.status(400).json({ success: false, message: "No Stripe payment intent found for this order" });
    }

    let stripeRefund = null;
    if (refundStatus === "completed") {
      try {
        const stripe = getStripeClient();
        stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
      } catch (stripeError) {
        return res.status(502).json({
          success: false,
          message: `Stripe refund failed: ${stripeError.message}`,
        });
      }
    }

    returnRequest.refundStatus = refundStatus;
    if (refundStatus === "completed") {
      returnRequest.status = "refunded";
    }
    returnRequest.reviewedBy = adminId;
    returnRequest.reviewedAt = new Date();
    await returnRequest.save();

    return res.status(200).json({
      success: true,
      data: returnRequest,
      message: `Return marked as ${refundStatus}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReturn,
  getReturns,
  approveReturn,
  rejectReturn,
  refundReturn,
};
