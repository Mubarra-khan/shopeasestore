const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: "", trim: true },
  image: { type: String, required: true, trim: true },
  buttonText: { type: String, default: "", trim: true },
  link: { type: String, default: "", trim: true },
  category: { type: String, default: "", trim: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { timestamps: true });

bannerSchema.index({ sortOrder: 1, createdAt: -1 });

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
