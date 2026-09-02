const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema({
  // Applicant Info
  applicantUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  // Business Information
  businessName: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  businessDescription: {
    type: String,
    required: true,
    trim: true,
  },

  businessAddress: {
    type: String,
    required: true,
    trim: true,
  },

  website: {
    type: String,
    trim: true,
    default: null,
  },

  // Application Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // Rejection Info
  rejectionReason: {
    type: String,
    default: null,
  },

  // Admin Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  reviewedAt: {
    type: Date,
    default: null,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
sellerApplicationSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

// Index to prevent duplicate pending applications
sellerApplicationSchema.index(
  { applicantUserId: 1, status: 1 },
  {
    unique: false,
    sparse: true,
  }
);

const SellerApplication = mongoose.model(
  "SellerApplication",
  sellerApplicationSchema
);

module.exports = SellerApplication;
