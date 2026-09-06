const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const {
  checkout,
  getOrders,
  getOrderById,
  getOrderReviewStatus,
  getManagedOrders,
  getManagedCancelledOrders,
  updateOrderStatus,
  createPaymentSession,
  createStripeCheckoutSession,
  getOrderByStripeSessionId,
  cancelOrder,
  markOrderAsPaid,
} = require("../controllers/order.controller");

router.post("/checkout", authMiddleware, checkout);
router.post("/stripe-session", authMiddleware, createStripeCheckoutSession);
router.get("/by-session/:sessionId", authMiddleware, getOrderByStripeSessionId);
router.post(
  "/:orderId/payment-session",
  authMiddleware,
  createPaymentSession
);
router.get(
  "/management",
  authMiddleware,
  authorizeRoles("seller", "admin"),
  getManagedOrders
);
router.get(
  "/management/cancelled",
  authMiddleware,
  authorizeRoles("seller", "admin"),
  getManagedCancelledOrders
);
router.patch(
  "/:orderId/status",
  authMiddleware,
  authorizeRoles("seller", "admin"),
  updateOrderStatus
);
router.patch(
  "/:orderId/mark-paid",
  authMiddleware,
  authorizeRoles("seller", "admin"),
  markOrderAsPaid
);
router.delete("/:orderId", authMiddleware, cancelOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:orderId", authMiddleware, getOrderById);
router.get("/:orderId/review-status", authMiddleware, getOrderReviewStatus);

module.exports = router;
