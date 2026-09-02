const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["category", "subcategory", "product"],
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

suggestionSchema.index({ order: 1 });

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

module.exports = Suggestion;
