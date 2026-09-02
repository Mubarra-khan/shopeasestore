const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["customer", "seller", "admin"],
    default: "customer",
  },

  resetPasswordToken: {
    type: String,
    select: false,
  },

  resetPasswordExpires: {
    type: Date,
    select: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;