const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const {
  createConversation,
  startProductConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesRead,
  getAllConversations,
  uploadChatAttachment,
} = require("../controllers/chat.controller");
const { chatUpload } = require("../utils/chatUpload");

router.post("/", authMiddleware, createConversation);
router.get("/", authMiddleware, getConversations);
router.get("/admin/all", authMiddleware, authorizeRoles("admin"), getAllConversations);
router.get("/:id/messages", authMiddleware, getMessages);
router.post("/:id/messages", authMiddleware, sendMessage);
router.post("/:id/read", authMiddleware, markMessagesRead);
router.post("/product/:productId", authMiddleware, startProductConversation);
router.post("/upload", authMiddleware, chatUpload.single("file"), uploadChatAttachment);

module.exports = router;
