const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", authMiddleware, getNotifications);
router.patch("/:id/read", authMiddleware, markNotificationRead);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
