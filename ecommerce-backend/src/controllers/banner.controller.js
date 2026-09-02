const Banner = require("../models/Banner");
const { imageUpload } = require("../utils/imageUpload");
const multer = require("multer");

const uploadBannerImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    return res.status(200).json({ success: true, data: { image: imageUrl } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ sortOrder: 1, createdAt: -1 });

    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return res.status(201).json({ success: true, data: banner, message: "Banner created successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({ success: true, data: banner, message: "Banner updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
};
