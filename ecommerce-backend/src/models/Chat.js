const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    trim: true,
    default: "",
  },
  attachment: {
    type: {
      type: String,
      enum: ["image", "video", "file"],
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    size: {
      type: Number,
      required: false,
    },
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
