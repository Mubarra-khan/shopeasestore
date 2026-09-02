const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const {
  createCoupon,
  listCoupons,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
  createSellerCoupon,
  getSellerCoupons,
} = require("../controllers/coupon.controller");

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createCoupon
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  listCoupons
);
router.post("/validate", authMiddleware, validateCoupon);
router.patch(
  "/:couponId/toggle",
  authMiddleware,
  authorizeRoles("admin"),
  toggleCoupon
);
router.patch(
  "/:couponId",
  authMiddleware,
  authorizeRoles("admin"),
  updateCoupon
);
router.delete(
  "/:couponId",
  authMiddleware,
  authorizeRoles("admin"),
  deleteCoupon
);

router.post(
  "/seller/coupons",
  authMiddleware,
  authorizeRoles("seller"),
  createSellerCoupon
);
router.get(
  "/seller/coupons",
  authMiddleware,
  authorizeRoles("seller"),
  getSellerCoupons
);

module.exports = router;
