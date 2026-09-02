require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Coupon = require("../src/models/Coupon");
const User = require("../src/models/user.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const customer = await User.findOne({ role: "customer" }).select("_id role");
  if (!customer) {
    throw new Error("No existing customer account found for validation");
  }

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const coupon = await Coupon.findOneAndUpdate(
    { code: "SAVE10" },
    {
      $set: {
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        minimumOrderAmount: 0,
        maximumDiscountAmount: null,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        expiresAt,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const token = jwt.sign(
    { userId: customer._id, role: customer.role },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
  const response = await fetch("http://localhost:5000/api/coupons/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code: "SAVE10", orderAmount: 90000 }),
  });
  const payload = await response.json();

  console.log(JSON.stringify({
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
    },
    validation: {
      status: response.status,
      success: payload.success,
      data: payload.data,
      expectedDiscount: 9000,
      expectedFinalAmount: 81000,
    },
  }, null, 2));

  await mongoose.disconnect();

  if (
    response.status !== 200 ||
    !payload.success ||
    payload.data?.discountAmount !== 9000 ||
    payload.data?.finalOrderAmount !== 81000
  ) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});