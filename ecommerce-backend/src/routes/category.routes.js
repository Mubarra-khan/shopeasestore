const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getChildSubcategories,
  createChildSubcategory,
  updateChildSubcategory,
  deleteChildSubcategory,
} = require("../controllers/category.controller");

router.get("/categories", getCategories);
router.post("/categories", authMiddleware, authorizeRoles("admin"), createCategory);
router.patch("/categories/:id", authMiddleware, authorizeRoles("admin"), updateCategory);
router.delete("/categories/:id", authMiddleware, authorizeRoles("admin"), deleteCategory);

router.get("/categories/:categoryId/subcategories", getSubcategories);
router.post("/categories/:categoryId/subcategories", authMiddleware, authorizeRoles("admin"), createSubcategory);
router.patch("/subcategories/:id", authMiddleware, authorizeRoles("admin"), updateSubcategory);
router.delete("/subcategories/:id", authMiddleware, authorizeRoles("admin"), deleteSubcategory);
router.get("/subcategories/:subcategoryId/children", getChildSubcategories);
router.post("/subcategories/:subcategoryId/children", authMiddleware, authorizeRoles("admin"), createChildSubcategory);
router.patch("/child-subcategories/:id", authMiddleware, authorizeRoles("admin"), updateChildSubcategory);
router.delete("/child-subcategories/:id", authMiddleware, authorizeRoles("admin"), deleteChildSubcategory);

module.exports = router;
