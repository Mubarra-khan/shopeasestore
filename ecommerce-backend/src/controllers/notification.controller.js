const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    return res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await notification.deleteOne();

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
