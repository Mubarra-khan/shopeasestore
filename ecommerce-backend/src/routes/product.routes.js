const express = require("express");
const router = express.Router();

const {
    getAllProducts,
    getSellerProducts,
    getSellerDashboardStats,
    getSellerAnalytics,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductVideo,
    getFilterOptions,
} = require("../controllers/product.controller");

const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");
const { imageUpload, videoUpload } = require("../utils/imageUpload");
const multer = require("multer");

// Public
router.get("/", getAllProducts);
router.get("/filter-options", getFilterOptions);

// Protected - seller only
router.get("/seller", authMiddleware, authorizeRoles("seller"), getSellerProducts);
router.get("/seller/stats", authMiddleware, authorizeRoles("seller"), getSellerDashboardStats);
router.get("/seller/analytics", authMiddleware, authorizeRoles("seller"), getSellerAnalytics);

// Public by ID but seller access is restricted within controller
router.get("/:id", getProductById);

// Protected - sellers only
router.post("/", authMiddleware, authorizeRoles("seller"), createProduct);
router.post("/upload-image", authMiddleware, authorizeRoles("seller"), (req, res, next) => {
    imageUpload.single("image")(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller" });
        }
        if (error) return res.status(400).json({ success: false, message: error.message });
        return next();
    });
}, uploadProductImage);
router.post("/upload-video", authMiddleware, authorizeRoles("seller"), (req, res, next) => {
    videoUpload.single("video")(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "Video must be 50 MB or smaller" });
        }
        if (error) return res.status(400).json({ success: false, message: error.message });
        return next();
    });
}, uploadProductVideo);
router.put("/:id", authMiddleware, authorizeRoles("seller"), updateProduct);
router.delete("/:id", authMiddleware, authorizeRoles("seller"), deleteProduct);

module.exports = router;