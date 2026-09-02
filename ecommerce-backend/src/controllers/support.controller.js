const mongoose = require("mongoose");
const User = require("../models/user.model");
const Chat = require("../models/Chat");

const getAiSupportResponse = async (req, res) => {
  try {
    const { message } = req.body || {};
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const normalizedMessage = String(message).trim().toLowerCase();

    const topics = {
      order: ["order", "tracking", "delivery", "shipment", "status"],
      product: ["product", "item", "stock", "availability", "price"],
      shipping: ["shipping", "delivery", "address", "courier", "transit"],
      return: ["return", "refund", "exchange", "money back"],
      payment: ["payment", "stripe", "cod", "cash on delivery", "transaction", "charge"],
      coupon: ["coupon", "discount", "promo", "code", "offer"],
      account: ["account", "profile", "password", "login", "register", "settings"],
    };

    let matchedTopic = "general";
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some((keyword) => normalizedMessage.includes(keyword))) {
        matchedTopic = topic;
        break;
      }
    }

    const responses = {
      order: "You can view all your orders in 'My Orders'. If you need to cancel an order, open the order details and use the cancel option if it's still eligible.",
      product: "Product details, stock, and pricing are shown on each product page. If a product is out of stock, you won't be able to add it to your cart.",
      shipping: "Shipping addresses are set during checkout. Once an order is placed, the shipping address cannot be changed. Please contact support if you need assistance.",
      return: "Eligible delivered orders can be returned through the order details page. Admin will review your request and process a refund if approved.",
      payment: "We support Stripe and Cash on Delivery. Stripe payments are processed securely. COD orders are paid upon delivery.",
      coupon: "You can apply a coupon code at checkout. If the coupon is valid, the discount will be applied to your order total.",
      account: "You can manage your account details through your profile. If you need to reset your password, use the forgot password option on the login page.",
      general: "I'm here to help with orders, products, shipping, returns, payments, coupons, and account questions. For complex issues, you can request human support.",
    };

    const aiMessage = responses[matchedTopic] || responses.general;

    return res.status(200).json({
      success: true,
      data: {
        message: aiMessage,
        topic: matchedTopic,
        suggestedActions: matchedTopic !== "general" ? ["Request Human Support"] : [],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSupportConversation = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { message } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const admin = await User.findOne({ role: "admin" }).select("_id");
    if (!admin) {
      return res.status(404).json({ success: false, message: "No support agent available" });
    }

    const participants = [userId, admin._id];
    const chat = await Chat.create({
      participants,
      messages: [
        {
          sender: userId,
          text: String(message).trim(),
        },
      ],
    });

    await chat.populate("participants", "name email role");

    return res.status(201).json({
      success: true,
      data: chat,
      message: "Support conversation created successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAiSupportResponse,
  createSupportConversation,
};
