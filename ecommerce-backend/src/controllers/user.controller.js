const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const SellerApplication = require("../models/SellerApplication");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Return = require("../models/Return");
const Review = require("../models/Review");
const { sendEmail } = require("../utils/email");

const sellerResponse = (user) => {
  const response = user.toObject ? user.toObject() : user;
  return {
    _id: response._id,
    name: response.name,
    email: response.email,
    role: response.role,
    isActive: response.isActive,
    ...(response.createdAt ? { createdAt: response.createdAt } : {}),
  };
};

const getAllUsers = (req, res) => {
  res.status(200).json({
    success: true,
    message: "All Users API Working",
  });
};

const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT secret not configured' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: userResponse,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      if (process.env.NODE_ENV === "production") {
        return res.status(200).json({
          success: true,
          message: "If an account exists with that email, a verification code has been sent.",
        });
      }

      return res.status(404).json({
        success: false,
        message: "No account found with that email",
      });
    }

    const resetCode = String(crypto.randomInt(100000, 999999));
    const resetCodeHash = await bcrypt.hash(resetCode, 10);
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = resetCodeHash;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();

    const maskedEmail = user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => `${a}${"*".repeat(Math.max(b.length, 3))}${c}`);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">ShopEase Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your ShopEase account associated with <strong>${maskedEmail}</strong>.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 20px 0;">
          ${resetCode}
        </div>
        <p style="color: #dc2626; font-weight: bold;">This code will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 12px;">For security reasons, do not share this code with anyone. ShopEase will never ask you for your password or verification code.</p>
      </div>
    `;

    const emailText = `ShopEase Password Reset\n\nYour verification code is: ${resetCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this reset, please ignore this email.`;

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail({
          to: user.email,
          subject: "ShopEase Password Reset - Verification Code",
          html: emailHtml,
          text: emailText,
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Password reset email delivery failed:", emailError.message);
      }
    }

    const response = {
      success: true,
      message: emailSent ? "Password reset code sent to your email" : "Password reset code generated",
    };

    if (!emailSent && process.env.NODE_ENV === "development") {
      response.resetCode = resetCode;
      response.developmentNote = "Email service not configured. OTP returned for local testing only.";
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const users = await User.find({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    const user = users.find((u) => u.resetPasswordToken && bcrypt.compareSync(code, u.resetPasswordToken));

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const resetSessionToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      success: true,
      message: "Verification successful",
      resetSessionToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, resetSessionToken, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters",
      });
    }

    let userId = null;

    if (resetSessionToken) {
      try {
        const decoded = jwt.verify(resetSessionToken, process.env.JWT_SECRET);
        if (decoded.type !== 'password-reset') {
          return res.status(400).json({
            success: false,
            message: "Invalid reset session",
          });
        }
        userId = decoded.userId;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset session",
        });
      }
    } else if (token) {
      const users = await User.find({
        resetPasswordExpires: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordExpires");

      const matchedUser = users.find((u) => u.resetPasswordToken && bcrypt.compareSync(token, u.resetPasswordToken));
      if (!matchedUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset code",
        });
      }
      userId = matchedUser._id;
    } else {
      return res.status(400).json({
        success: false,
        message: "Reset session or code is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const { userId } = req.user;

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name image price seller')
      .populate('order', '_id status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

  const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("_id name email role isActive createdAt")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: sellers.map(sellerResponse),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: sellers.map((seller) => ({
        _id: seller._id,
        name: seller.name,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({ success: false, message: "Name must be between 2 and 100 characters" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "A user with that email already exists" });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "seller",
    });

    return res.status(201).json({
      success: true,
      message: "Seller created successfully",
      data: sellerResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A user with that email already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Seller Application Endpoints

const submitSellerApplication = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email, phone, businessName, category, businessDescription, businessAddress, website } = req.body;

    // Validation
    if (!name || !email || !phone || !businessName || !category || !businessDescription || !businessAddress) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Normalize inputs
    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    const normalizedBusinessName = String(businessName).trim();
    const normalizedCategory = String(category).trim();
    const normalizedDescription = String(businessDescription).trim();
    const normalizedAddress = String(businessAddress).trim();
    const normalizedWebsite = website ? String(website).trim() : null;

    // Validation checks
    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({ success: false, message: "Name must be between 2 and 100 characters" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    if (normalizedPhone.length < 5 || normalizedPhone.length > 20) {
      return res.status(400).json({ success: false, message: "Phone must be between 5 and 20 characters" });
    }

    if (normalizedBusinessName.length < 2 || normalizedBusinessName.length > 100) {
      return res.status(400).json({ success: false, message: "Business name must be between 2 and 100 characters" });
    }

    if (normalizedCategory.length < 2 || normalizedCategory.length > 50) {
      return res.status(400).json({ success: false, message: "Category must be between 2 and 50 characters" });
    }

    if (normalizedDescription.length < 10 || normalizedDescription.length > 1000) {
      return res.status(400).json({ success: false, message: "Description must be between 10 and 1000 characters" });
    }

    if (normalizedAddress.length < 5 || normalizedAddress.length > 200) {
      return res.status(400).json({ success: false, message: "Address must be between 5 and 200 characters" });
    }

    if (normalizedWebsite && (normalizedWebsite.length < 5 || normalizedWebsite.length > 255)) {
      return res.status(400).json({ success: false, message: "Website URL must be between 5 and 255 characters" });
    }

    // Check if user exists and is customer
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "customer") {
      return res.status(400).json({ success: false, message: "Only customers can apply to become sellers" });
    }

    // Check for existing pending application
    const existingPendingApp = await SellerApplication.findOne({
      applicantUserId: userId,
      status: "pending",
    });

    if (existingPendingApp) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending application. Please wait for admin review.",
        data: existingPendingApp,
      });
    }

    // Create application
    const application = await SellerApplication.create({
      applicantUserId: userId,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      businessName: normalizedBusinessName,
      category: normalizedCategory,
      businessDescription: normalizedDescription,
      businessAddress: normalizedAddress,
      website: normalizedWebsite,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMySellerApplication = async (req, res) => {
  try {
    const { userId } = req.user;

    const application = await SellerApplication.findOne({
      applicantUserId: userId,
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSellerApplications = async (req, res) => {
  try {
    const { status } = req.query; // optional filter: pending, approved, rejected

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const applications = await SellerApplication.find(filter)
      .populate("applicantUserId", "_id name email role createdAt")
      .populate("reviewedBy", "_id name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveSellerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user;

    // Check application exists
    const application = await SellerApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check status is pending
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    // Update application
    application.status = "approved";
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Update user role
    const user = await User.findById(application.applicantUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = "seller";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: {
        application,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectSellerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: adminId } = req.user;
    const { rejectionReason } = req.body;

    // Check application exists
    const application = await SellerApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check status is pending
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    // Update application
    application.status = "rejected";
    application.rejectionReason = rejectionReason || null;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const products = await Product.find();
    const sellers = await User.find({ role: 'seller' });
    const coupons = await Coupon.find();

    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled');
    const pendingOrders = orders.filter((order) => order.status === 'pending').length;

    const refundedOrderIds = new Set();
    const returnDocs = await Return.find({ status: 'refunded' }).select('order');
    returnDocs.forEach((r) => refundedOrderIds.add(r.order.toString()));

    const revenue = paidOrders
      .filter((order) => !refundedOrderIds.has(order._id.toString()))
      .reduce((sum, order) => sum + Number(order.finalAmount ?? order.totalAmount ?? 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders,
        revenue,
        totalSellers: sellers.length,
        activeCoupons: coupons.filter((coupon) => coupon.isActive).length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyAnalytics = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const returnDocs = await Return.find({ status: 'refunded' }).select('order');
    const refundedOrderIds = new Set(returnDocs.map((r) => r.order.toString()));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthOrders = orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    });

    const eligibleCurrentMonthOrders = currentMonthOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled' && !refundedOrderIds.has(order._id.toString()));

    const currentMonthStats = {
      totalOrders: currentMonthOrders.length,
      deliveredOrders: currentMonthOrders.filter((order) => order.status === 'delivered').length,
      cancelledOrders: currentMonthOrders.filter((order) => order.status === 'cancelled').length,
      pendingProcessingOrders: currentMonthOrders.filter((order) => ['pending', 'processing'].includes(order.status)).length,
      revenue: eligibleCurrentMonthOrders.reduce((sum, order) => sum + Number(order.finalAmount ?? order.totalAmount ?? 0), 0),
    };

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthOrders = orders.filter((order) => {
        const created = new Date(order.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      });

      const eligibleMonthOrders = monthOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled' && !refundedOrderIds.has(order._id.toString()));

      monthlyTrend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year,
        totalOrders: monthOrders.length,
        deliveredOrders: monthOrders.filter((order) => order.status === 'delivered').length,
        cancelledOrders: monthOrders.filter((order) => order.status === 'cancelled').length,
        revenue: eligibleMonthOrders.reduce((sum, order) => sum + Number(order.finalAmount ?? order.totalAmount ?? 0), 0),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        currentMonth: currentMonthStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid seller ID" });
    }

    const seller = await User.findById(sellerId).select("-password");
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const productCount = await Product.countDocuments({ seller: sellerId });
    const orderCount = await Order.countDocuments({ "items.product": { $in: await Product.find({ seller: sellerId }).distinct("_id") } });
    const couponCount = await Coupon.countDocuments({ seller: sellerId });

    return res.status(200).json({
      success: true,
      data: {
        ...sellerResponse(seller),
        productCount,
        orderCount,
        couponCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deactivateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid seller ID" });
    }

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.isActive = false;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller deactivated successfully",
      data: sellerResponse(seller),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const activateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid seller ID" });
    }

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.isActive = true;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller activated successfully",
      data: sellerResponse(seller),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid seller ID" });
    }

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const productCount = await Product.countDocuments({ seller: sellerId });
    const couponCount = await Coupon.countDocuments({ seller: sellerId });
    const sellerAppCount = await SellerApplication.countDocuments({ applicantUserId: sellerId });

    const productIds = await Product.find({ seller: sellerId }).distinct("_id");
    const orderCount = await Order.countDocuments({ "items.product": { $in: productIds } });
    const reviewCount = await Review.countDocuments({ product: { $in: productIds } });

    const references = [];
    if (productCount > 0) references.push({ type: "products", count: productCount });
    if (couponCount > 0) references.push({ type: "coupons", count: couponCount });
    if (sellerAppCount > 0) references.push({ type: "sellerApplications", count: sellerAppCount });
    if (orderCount > 0) references.push({ type: "orders", count: orderCount });
    if (reviewCount > 0) references.push({ type: "reviews", count: reviewCount });

    if (references.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete seller due to existing references",
        data: { references },
      });
    }

    await User.findByIdAndDelete(sellerId);

    return res.status(200).json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  signupUser,
  loginUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserProfile,
  getMyReviews,
  getSellers,
  getPublicSellers,
  createSeller,
  submitSellerApplication,
  getMySellerApplication,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  getAdminStats,
  getMonthlyAnalytics,
  getSellerDetails,
  deactivateSeller,
  activateSeller,
  deleteSeller,
};