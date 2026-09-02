const express = require("express");
const router = express.Router();
const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
} = require("../controllers/banner.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");
const { imageUpload } = require("../utils/imageUpload");
const multer = require("multer");

router.get("/banners", getPublicBanners);
router.get("/admin/banners", authMiddleware, authorizeRoles("admin"), getAdminBanners);
router.post("/admin/banners", authMiddleware, authorizeRoles("admin"), createBanner);
router.patch("/admin/banners/:id", authMiddleware, authorizeRoles("admin"), updateBanner);
router.delete("/admin/banners/:id", authMiddleware, authorizeRoles("admin"), deleteBanner);
router.post("/admin/banners/upload-image", authMiddleware, authorizeRoles("admin"), imageUpload.single("image"), uploadBannerImage);

module.exports = router;
