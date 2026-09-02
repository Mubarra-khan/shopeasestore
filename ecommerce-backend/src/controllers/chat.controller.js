const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/user.model");
const { chatUpload } = require("../utils/chatUpload");

const createConversation = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { participantId, orderId, productId, message, attachment } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!participantId || (!message || !String(message).trim()) && !attachment?.url) {
      return res.status(400).json({ success: false, message: "Participant and message are required" });
    }

    const participants = [userId, participantId];

    let order = null;
    let product = null;

    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    }

    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
    }

    let chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
      order: orderId || null,
      product: productId || null,
    });

    const trimmedMessage = String(message || "").trim();

    const buildMessage = () => {
      const msg = {
        sender: userId,
        text: trimmedMessage || "",
      };
      if (attachment?.url) {
        msg.attachment = {
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
          size: attachment.size,
        };
      }
      return msg;
    };

    if (!chat) {
      chat = await Chat.create({
        participants,
        order: orderId || null,
        product: productId || null,
        lastMessage: trimmedMessage || "Sent an attachment",
        lastMessageAt: new Date(),
        messages: [buildMessage()],
      });
    } else {
      chat.messages.push(buildMessage());
      chat.lastMessage = trimmedMessage || "Sent an attachment";
      chat.lastMessageAt = new Date();
      await chat.save();
    }

    return res.status(201).json({
      success: true,
      data: chat,
      message: "Conversation created successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const startProductConversation = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { productId } = req.params;
    const { message, attachment } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const product = await Product.findById(productId).select("_id seller");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.seller) {
      return res.status(400).json({ success: false, message: "Product has no assigned seller" });
    }

    const sellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();

    if (sellerId === userId) {
      return res.status(400).json({ success: false, message: "You cannot start a conversation with yourself" });
    }

    const participants = [userId, sellerId];

    let chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
      product: productId,
      order: null,
    });

    const trimmedMessage = String(message).trim();

    const buildMessage = () => {
      const msg = {
        sender: userId,
        text: trimmedMessage,
      };
      if (attachment?.url) {
        msg.attachment = {
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
          size: attachment.size,
        };
      }
      return msg;
    };

    if (!chat) {
      chat = await Chat.create({
        participants,
        product: productId,
        order: null,
        lastMessage: trimmedMessage,
        lastMessageAt: new Date(),
        messages: [buildMessage()],
      });
    } else {
      chat.messages.push(buildMessage());
      chat.lastMessage = trimmedMessage;
      chat.lastMessageAt = new Date();
      await chat.save();
    }

    await chat.populate("participants", "name email role");
    await chat.populate("product", "name image");

    return res.status(201).json({
      success: true,
      data: chat,
      message: "Conversation started successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email role")
      .populate("product", "name image")
      .populate("order", "status paymentStatus")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden: you are not a participant" });
    }

    return res.status(200).json({ success: true, data: chat.messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { id } = req.params;
    const { text, attachment } = req.body || {};

    if ((!text || !String(text).trim()) && !attachment?.url) {
      return res.status(400).json({ success: false, message: "Message text or attachment is required" });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden: you are not a participant" });
    }

    const trimmedMessage = String(text || "").trim();

    const message = {
      sender: userId,
      text: trimmedMessage || "",
    };

    if (attachment?.url) {
      message.attachment = {
        type: attachment.type,
        url: attachment.url,
        name: attachment.name,
        size: attachment.size,
      };
    }

    chat.messages.push(message);
    chat.lastMessage = trimmedMessage || "Sent an attachment";
    chat.lastMessageAt = new Date();
    await chat.save();

    return res.status(201).json({
      success: true,
      data: chat.messages[chat.messages.length - 1],
      message: "Message sent successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden: you are not a participant" });
    }

    let updated = false;
    chat.messages.forEach((message) => {
      const readBy = message.readBy || [];
      const alreadyRead = readBy.some(
        (read) => read.user.toString() === userId
      );
      if (!alreadyRead && message.sender.toString() !== userId) {
        message.readBy = readBy;
        message.readBy.push({ user: userId, readAt: new Date() });
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    return res.status(200).json({
      success: true,
      message: updated ? "Messages marked as read" : "Messages were already read",
      data: chat.messages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("participants", "name email role")
      .populate("product", "name image")
      .populate("order", "status paymentStatus")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadChatAttachment = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const protocol = req.protocol;
    const host = req.get("host");
    const url = `${protocol}://${host}/uploads/chat/${req.file.filename}`;
    const type = req.file.mimetype.startsWith("video/")
      ? "video"
      : req.file.mimetype.startsWith("image/")
        ? "image"
        : "file";

    return res.status(201).json({
      success: true,
      data: { url, type, name: req.file.originalname, size: req.file.size },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createConversation,
  startProductConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesRead,
  getAllConversations,
  uploadChatAttachment,
};
