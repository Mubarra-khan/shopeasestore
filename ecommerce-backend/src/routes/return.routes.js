const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const {
  createReturn,
  getReturns,
  approveReturn,
  rejectReturn,
  refundReturn,
} = require("../controllers/return.controller");

router.post("/", authMiddleware, createReturn);
router.get("/", authMiddleware, getReturns);
router.patch("/:id/approve", authMiddleware, authorizeRoles("seller", "admin"), approveReturn);
router.patch("/:id/reject", authMiddleware, authorizeRoles("seller", "admin"), rejectReturn);
router.patch("/:id/refund", authMiddleware, authorizeRoles("seller", "admin"), refundReturn);

module.exports = router;
