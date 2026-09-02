const express = require("express");
const router = express.Router();
const {
  authMiddleware,
} = require("../middleware/auth.middleware");
const {
  getAiSupportResponse,
  createSupportConversation,
} = require("../controllers/support.controller");

router.post("/ai", authMiddleware, getAiSupportResponse);
router.post("/conversation", authMiddleware, createSupportConversation);

module.exports = router;
