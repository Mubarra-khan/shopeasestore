const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

const normalizeCode = (code) =>
  typeof code === "string" ? code.trim().toUpperCase() : "";

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const validateCouponInput = (input, { requireCode = true } = {}) => {
  const errors = [];
  const code = normalizeCode(input.code);

  if (requireCode && !code) {
    errors.push("Coupon code is required");
  }
  if (input.discountType === undefined && requireCode) {
    errors.push("Discount type is required");
  }
  if (input.discountValue === undefined && requireCode) {
    errors.push("Discount value is required");
  }
  if (input.expiresAt === undefined && requireCode) {
    errors.push("Expiration date is required");
  }
  if (
    input.discountType !== undefined &&
    !["percentage", "fixed"].includes(input.discountType)
  ) {
    errors.push("Invalid discount type");
  }
  if (
    input.discountValue !== undefined &&
    (typeof input.discountValue !== "number" ||
      !Number.isFinite(input.discountValue) ||
      input.discountValue <= 0 ||
      (input.discountType === "percentage" && input.discountValue > 100))
  ) {
    errors.push(
      input.discountType === "percentage"
        ? "Percentage discount must be greater than 0 and at most 100"
        : "Fixed discount must be greater than 0"
    );
  }
  if (
    input.minimumOrderAmount !== undefined &&
    (typeof input.minimumOrderAmount !== "number" ||
      !Number.isFinite(input.minimumOrderAmount) ||
      input.minimumOrderAmount < 0)
  ) {
    errors.push("Minimum order amount cannot be negative");
  }
  if (
    input.maximumDiscountAmount !== undefined &&
    input.maximumDiscountAmount !== null &&
    (typeof input.maximumDiscountAmount !== "number" ||
      !Number.isFinite(input.maximumDiscountAmount) ||
      input.maximumDiscountAmount < 0)
  ) {
    errors.push("Maximum discount amount cannot be negative");
  }
  if (input.expiresAt !== undefined) {
    const expiresAt = new Date(input.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      errors.push("Expiration must be a valid future date");
    }
  }
  if (
    input.usageLimit !== undefined &&
    input.usageLimit !== null &&
    !isPositiveInteger(input.usageLimit)
  ) {
    errors.push("Usage limit must be a positive integer");
  }

  return { code, errors };
};

const getCouponFailure = (coupon, orderAmount) => {
  if (!coupon) return "Coupon not found";
  if (!coupon.isActive) return "Coupon is inactive";
  if (coupon.expiresAt <= new Date()) return "Coupon has expired";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "Coupon usage limit reached";
  }
  if (orderAmount < coupon.minimumOrderAmount) {
    return `Minimum order amount is ${coupon.minimumOrderAmount}`;
  }
  return null;
};

const calculateDiscount = (coupon, orderAmount) => {
  let discountAmount =
    coupon.discountType === "percentage"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maximumDiscountAmount !== null) {
    discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
  }

  discountAmount = Math.min(Math.max(discountAmount, 0), orderAmount);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    discountAmount,
    finalOrderAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
  };
};

const findUsableCoupon = async (code, orderAmount, sellerId = null) => {
  const normalizedCode = normalizeCode(code);
  const coupon = await Coupon.findOne({ code: normalizedCode });
  const failure = getCouponFailure(coupon, orderAmount);

  if (failure) {
    const error = new Error(failure);
    error.statusCode = failure === "Coupon not found" ? 404 : 400;
    throw error;
  }

  if (sellerId && coupon.seller && coupon.seller.toString() !== sellerId) {
    const error = new Error("This coupon is not valid for your products");
    error.statusCode = 403;
    throw error;
  }

  return {
    coupon,
    ...calculateDiscount(coupon, orderAmount),
  }
};

const consumeCouponUsage = async (couponId, session) => {
  const coupon = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true, session }
  );

  if (!coupon) {
    const error = new Error("Coupon usage limit reached or coupon no longer exists");
    error.statusCode = 400;
    throw error;
  }

  return coupon;
};

const createCoupon = async (req, res) => {
  try {
    const input = req.body || {};
    const { code, errors } = validateCouponInput(input);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    const coupon = await Coupon.create({
      code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minimumOrderAmount: input.minimumOrderAmount,
      maximumDiscountAmount: input.maximumDiscountAmount,
      expiresAt: input.expiresAt,
      usageLimit: input.usageLimit,
      isActive: true,
      usedCount: 0,
    });

    return res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }

    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const input = req.body || {};
    const merged = {
      code: input.code === undefined ? existingCoupon.code : input.code,
      discountType:
        input.discountType === undefined ? existingCoupon.discountType : input.discountType,
      discountValue:
        input.discountValue === undefined ? existingCoupon.discountValue : input.discountValue,
      minimumOrderAmount:
        input.minimumOrderAmount === undefined
          ? existingCoupon.minimumOrderAmount
          : input.minimumOrderAmount,
      maximumDiscountAmount:
        input.maximumDiscountAmount === undefined
          ? existingCoupon.maximumDiscountAmount
          : input.maximumDiscountAmount,
      expiresAt: input.expiresAt === undefined ? existingCoupon.expiresAt : input.expiresAt,
      usageLimit: input.usageLimit === undefined ? existingCoupon.usageLimit : input.usageLimit,
    };
    const { code, errors } = validateCouponInput(merged, { requireCode: true });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    const update = {};
    for (const field of [
      "discountType",
      "discountValue",
      "minimumOrderAmount",
      "maximumDiscountAmount",
      "expiresAt",
      "usageLimit",
    ]) {
      if (input[field] !== undefined) update[field] = input[field];
    }
    if (input.code !== undefined) update.code = code;

    const coupon = await Coupon.findByIdAndUpdate(couponId, update, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      data: coupon,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return res.status(200).json({
      success: true,
      data: coupon,
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body || {};
    const sellerId = req.user && req.user.role === 'seller' ? req.user.userId : null;
    if (!code || typeof orderAmount !== "number" || !Number.isFinite(orderAmount) || orderAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and a valid non-negative order amount are required",
      });
    }

    const result = await findUsableCoupon(code, orderAmount, sellerId);
    return res.status(200).json({
      success: true,
      data: {
        couponCode: result.coupon.code,
        discountType: result.coupon.discountType,
        discountAmount: result.discountAmount,
        originalOrderAmount: orderAmount,
        finalOrderAmount: result.finalOrderAmount,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const createSellerCoupon = async (req, res) => {
  try {
    const sellerId = req.user && req.user.userId;
    const input = req.body || {};
    const { code, errors } = validateCouponInput(input);

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    const coupon = await Coupon.create({
      code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minimumOrderAmount: input.minimumOrderAmount,
      maximumDiscountAmount: input.maximumDiscountAmount,
      expiresAt: input.expiresAt,
      usageLimit: input.usageLimit,
      isActive: true,
      usedCount: 0,
      seller: sellerId,
    });

    return res.status(201).json({
      success: true,
      data: coupon,
      message: "Seller coupon created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerCoupons = async (req, res) => {
  try {
    const sellerId = req.user && req.user.userId;
    const coupons = await Coupon.find({ seller: sellerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  normalizeCode,
  findUsableCoupon,
  calculateDiscount,
  consumeCouponUsage,
  createCoupon,
  listCoupons,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
  createSellerCoupon,
  getSellerCoupons,
};
