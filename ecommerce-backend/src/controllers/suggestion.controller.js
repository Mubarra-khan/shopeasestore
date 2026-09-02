const mongoose = require("mongoose");
const Suggestion = require("../models/Suggestion");

const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ active: true }).sort({ order: 1 }).lean();
    return res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSuggestion = async (req, res) => {
  try {
    const { label, type, targetId, categoryId, order, active } = req.body;

    if (!label || !type || !targetId) {
      return res.status(400).json({ success: false, message: "label, type, and targetId are required" });
    }

    const suggestion = await Suggestion.create({
      label,
      type,
      targetId,
      categoryId: type === 'subcategory' ? categoryId : undefined,
      order: order || 0,
      active: active !== undefined ? active : true,
    });

    return res.status(201).json({ success: true, data: suggestion, message: "Suggestion created successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, type, targetId, categoryId, order, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid suggestion ID" });
    }

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ success: false, message: "Suggestion not found" });
    }

    if (label !== undefined) suggestion.label = label;
    if (type !== undefined) suggestion.type = type;
    if (targetId !== undefined) suggestion.targetId = targetId;
    if (categoryId !== undefined) suggestion.categoryId = type === 'subcategory' ? categoryId : undefined;
    if (order !== undefined) suggestion.order = order;
    if (active !== undefined) suggestion.active = active;

    await suggestion.save();
    return res.status(200).json({ success: true, data: suggestion, message: "Suggestion updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid suggestion ID" });
    }

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ success: false, message: "Suggestion not found" });
    }

    await suggestion.deleteOne();
    return res.status(200).json({ success: true, message: "Suggestion deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuggestions,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
};
