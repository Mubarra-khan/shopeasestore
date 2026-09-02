const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  signupUser,
  loginUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserProfile,
  getMyReviews,
  getSellers,
  getPublicSellers,
  createSeller,
  submitSellerApplication,
  getMySellerApplication,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  getAdminStats,
  getMonthlyAnalytics,
  getSellerDetails,
  deactivateSeller,
  activateSeller,
  deleteSeller,
} = require("../controllers/user.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

// Public routes
router.get("/", getAllUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/sellers", getPublicSellers);

// Authenticated customer routes
router.get("/profile", authMiddleware, getUserProfile);
router.get("/me/reviews", authMiddleware, getMyReviews);
router.post("/seller-applications", authMiddleware, submitSellerApplication);
router.get("/seller-applications/me", authMiddleware, getMySellerApplication);

// Admin routes
router.get("/admin/sellers", authMiddleware, authorizeRoles("admin"), getSellers);
router.post("/admin/sellers", authMiddleware, authorizeRoles("admin"), createSeller);
router.get("/admin/sellers/:sellerId", authMiddleware, authorizeRoles("admin"), getSellerDetails);
router.patch("/admin/sellers/:sellerId/deactivate", authMiddleware, authorizeRoles("admin"), deactivateSeller);
router.patch("/admin/sellers/:sellerId/activate", authMiddleware, authorizeRoles("admin"), activateSeller);
router.delete("/admin/sellers/:sellerId", authMiddleware, authorizeRoles("admin"), deleteSeller);
router.get("/admin/seller-applications", authMiddleware, authorizeRoles("admin"), getSellerApplications);
router.patch("/admin/seller-applications/:id/approve", authMiddleware, authorizeRoles("admin"), approveSellerApplication);
router.patch("/admin/seller-applications/:id/reject", authMiddleware, authorizeRoles("admin"), rejectSellerApplication);

router.get("/admin-only", authMiddleware, authorizeRoles("admin"), (req, res) => {
  return res.status(200).json({ success: true, message: "Admin access granted", user: req.user });
});

router.get("/admin/stats", authMiddleware, authorizeRoles("admin"), getAdminStats);
router.get("/admin/analytics", authMiddleware, authorizeRoles("admin"), getMonthlyAnalytics);

module.exports = router;