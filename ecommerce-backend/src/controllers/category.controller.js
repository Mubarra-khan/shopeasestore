const mongoose = require("mongoose");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Category name and slug are required" });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || "",
      image: image || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: category, message: "Category created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category with this name or slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categoriesWithCount = await Category.find().sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: categoriesWithCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (name !== undefined) category.name = name;
    if (slug !== undefined) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return res.status(200).json({ success: true, data: category, message: "Category updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category with this name or slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subcategoryCount = await Subcategory.countDocuments({ category: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete category with existing subcategories. Remove subcategories first." });
    }

    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const subcategories = await Subcategory.find({ category: categoryId }).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getChildSubcategories = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const childSubcategories = await Subcategory.find({ parent: subcategoryId }).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: childSubcategories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Subcategory name and slug are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subcategory = await Subcategory.create({
      name,
      slug,
      category: categoryId,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: subcategory, message: "Subcategory created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Subcategory with this slug already exists in this category" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    if (category !== undefined && category !== subcategory.category.toString()) {
      const targetCategory = await Category.findById(category);
      if (!targetCategory) {
        return res.status(404).json({ success: false, message: "Target category not found" });
      }
      subcategory.category = category;
    }

    if (name !== undefined) subcategory.name = name;
    if (slug !== undefined) subcategory.slug = slug;
    if (isActive !== undefined) subcategory.isActive = isActive;

    await subcategory.save();
    return res.status(200).json({ success: true, data: subcategory, message: "Subcategory updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Subcategory with this slug already exists in this category" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    await subcategory.deleteOne();
    return res.status(200).json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createChildSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const { name, slug, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Child subcategory name and slug are required" });
    }

    const parent = await Subcategory.findById(subcategoryId);
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent subcategory not found" });
    }

    const childSubcategory = await Subcategory.create({
      name,
      slug,
      category: parent.category,
      parent: subcategoryId,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: childSubcategory, message: "Child subcategory created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Child subcategory with this slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateChildSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive, parent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid child subcategory ID" });
    }

    const childSubcategory = await Subcategory.findById(id);
    if (!childSubcategory) {
      return res.status(404).json({ success: false, message: "Child subcategory not found" });
    }

    if (name !== undefined) childSubcategory.name = name;
    if (slug !== undefined) childSubcategory.slug = slug;
    if (isActive !== undefined) childSubcategory.isActive = isActive;
    if (parent !== undefined) childSubcategory.parent = parent || null;

    await childSubcategory.save();
    return res.status(200).json({ success: true, data: childSubcategory, message: "Child subcategory updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Child subcategory with this slug already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteChildSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid child subcategory ID" });
    }

    const childSubcategory = await Subcategory.findById(id);
    if (!childSubcategory) {
      return res.status(404).json({ success: false, message: "Child subcategory not found" });
    }

    await childSubcategory.deleteOne();
    return res.status(200).json({ success: true, message: "Child subcategory deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
