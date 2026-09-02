const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");
const {
  getSuggestions,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
} = require("../controllers/suggestion.controller");

router.get("/suggestions", getSuggestions);
router.post("/admin/suggestions", authMiddleware, authorizeRoles("admin"), createSuggestion);
router.patch("/admin/suggestions/:id", authMiddleware, authorizeRoles("admin"), updateSuggestion);
router.delete("/admin/suggestions/:id", authMiddleware, authorizeRoles("admin"), deleteSuggestion);

module.exports = router;
