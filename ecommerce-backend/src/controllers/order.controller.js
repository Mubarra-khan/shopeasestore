const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const {
  findUsableCoupon,
} = require("./coupon.controller");
const Stripe = require("stripe");

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const checkout = async (req, res) => {
  let createdOrder = null;
  let couponData = null;

  try {
    const userId = req.user && req.user.userId;
    const couponCode = req.body && req.body.couponCode;
    const shippingAddress = req.body && req.body.shippingAddress;
    const paymentMethod = req.body && req.body.paymentMethod === 'cod' ? 'cod' : 'stripe';

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const selectedItems = req.body && Array.isArray(req.body.items) ? req.body.items : [];

    if (!selectedItems.length) {
      return res.status(400).json({
        success: false,
        message: "No items selected for checkout",
      });
    }

    // Fetch the authenticated user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    // Validate cart existence and non-empty state
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot create order from empty cart.",
      });
    }

    // Build a lookup of cart items by product ID
    const cartItemsByProductId = new Map();
    for (const cartItem of cart.items) {
      cartItemsByProductId.set(cartItem.product._id.toString(), cartItem);
    }

    // Validate and build order from selected items only
    const orderItems = [];
    let totalAmount = 0;

    for (const selected of selectedItems) {
      const productId = selected.productId;
      const quantity = Number(selected.quantity) || 1;

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID in selection",
        });
      }

      const cartItem = cartItemsByProductId.get(productId);
      if (!cartItem) {
        return res.status(400).json({
          success: false,
          message: `Product ${productId} is not in your cart`,
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${quantity}`,
        });
      }

      // Store historical pricing in order
      const subtotal = product.price * quantity;
      orderItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        quantity,
        subtotal,
      });

      totalAmount += subtotal;
    }

    if (couponCode) {
      couponData = await findUsableCoupon(couponCode, totalAmount);
    }

    const discountAmount = couponData ? couponData.discountAmount : 0;
    const finalAmount = Math.max(
      0,
      Math.round((totalAmount - discountAmount) * 100) / 100
    );

    // Create the order
    createdOrder = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      couponCode: couponData ? couponData.coupon.code : null,
      couponId: couponData ? couponData.coupon._id : null,
      discountAmount,
      finalAmount,
      status: "pending",
      shippingAddress,
      paymentMethod,
    });

    // Update product stock for each item in the order
    for (const orderItem of orderItems) {
      await Product.findByIdAndUpdate(
        orderItem.product,
        { $inc: { stock: -orderItem.quantity } },
        { new: true }
      );
    }

    // For COD, remove only the ordered items from the cart immediately
    if (paymentMethod === 'cod') {
      const orderedProductIds = orderItems.map((item) => item.product);
      await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: { $in: orderedProductIds } } } }
      );
    }

    // Populate order with product details for response
    const populatedOrder = await Order.findById(createdOrder._id).populate(
      "items.product",
      "name price image category"
    );

    return res.status(201).json({
      success: true,
      data: populatedOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    if (createdOrder && couponData) {
      await createdOrder.deleteOne();
    }
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch all orders for the authenticated user
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price image category")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate(
      "items.product",
      "name price image category seller"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (req.user.role === "seller") {
      const sellerProductIds = new Set(
        (await Product.find({ seller: userId }).select("_id")).map((product) => product._id.toString())
      );
      const sellerItems = order.items.filter((item) => {
        const productId = item.product && typeof item.product === "object"
          ? item.product._id?.toString()
          : item.product?.toString();
        return productId && sellerProductIds.has(productId);
      });

      if (sellerItems.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: order does not contain your products",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...order.toObject(),
          items: sellerItems,
          sellerRevenue: sellerItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
        },
      });
    }

    // Verify ownership for customer accounts.
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not own this order",
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderReviewStatus = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate("items.product", "name price image category");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not own this order",
      });
    }

    const productIds = order.items.map((item) => item.product._id || item.product);
    const reviews = await Review.find({ user: userId, product: { $in: productIds } }).select("product orderItem");

    const reviewedProductIds = new Set(reviews.map((review) => review.product.toString()));
    const reviewedOrderItemIds = new Set(reviews.map((review) => review.orderItem?.toString()).filter(Boolean));

    const statuses = order.items.map((item) => {
      const productId = item.product._id || item.product;
      const orderItemId = item._id;
      return {
        productId,
        productName: item.productName,
        hasReviewed: reviewedOrderItemIds.has(orderItemId?.toString()) || reviewedProductIds.has(productId?.toString()),
      };
    });

    return res.status(200).json({ success: true, data: statuses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getManagedOrders = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let orderFilter = {};
    let sellerProductIds = [];

    if (role === "seller") {
      const sellerProducts = await Product.find({ seller: userId }).select("_id");
      sellerProductIds = sellerProducts.map((product) => product._id.toString());
      orderFilter = { "items.product": { $in: sellerProducts.map((product) => product._id) } };
    }

    const orders = await Order.find(orderFilter)
      .populate("items.product", "name price image category seller")
      .sort({ createdAt: -1 });

    const filteredOrders = role === "seller"
      ? orders.map((order) => {
          const items = order.items.filter((item) => {
            const productId = item.product && typeof item.product === "object"
              ? item.product._id?.toString()
              : item.product?.toString();
            return productId && sellerProductIds.includes(productId);
          });

          return {
            ...order.toObject(),
            items,
            sellerRevenue: items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
          };
        })
      : orders;

    return res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (role === "seller") {
      const sellerProductIds = new Set(
        (await Product.find({ seller: userId }).select("_id")).map((product) => product._id.toString())
      );
      const hasSellerItem = order.items.some((item) => sellerProductIds.has(item.product.toString()));

      if (!hasSellerItem) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: order does not contain your products",
        });
      }
    }

    const currentStatus = order.status;
    const validTransitions = {
      pending: ["processing", "shipped", "delivered", "cancelled"],
      processing: ["shipped", "delivered", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    if (status === "cancelled") {
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          const currentOrder = await Order.findById(orderId).session(dbSession);

          if (!currentOrder || currentOrder.status === "cancelled") {
            return;
          }

          const stockByProduct = new Map();
          for (const orderItem of currentOrder.items) {
            const productId = orderItem.product.toString();
            stockByProduct.set(
              productId,
              (stockByProduct.get(productId) || 0) + orderItem.quantity
            );
          }

          const stockOperations = Array.from(stockByProduct, ([product, quantity]) => ({
            updateOne: {
              filter: { _id: product },
              update: { $inc: { stock: quantity } },
            },
          }));

          if (stockOperations.length > 0) {
            const stockResult = await Product.bulkWrite(stockOperations, {
              session: dbSession,
            });

            if (stockResult.matchedCount !== stockOperations.length) {
              throw new Error("One or more order products no longer exist");
            }
          }

          currentOrder.status = "cancelled";
          await currentOrder.save({ session: dbSession });
        });

        order.status = "cancelled";
      } finally {
        await dbSession.endSession();
      }
    } else {
      order.status = status;
      await order.save();
    }

    if (status === "delivered" && currentStatus !== "delivered") {
      const reviewNotifications = [];
      for (const item of order.items) {
        const productId = item.product.toString();
        const existingNotification = await Notification.findOne({
          user: order.user,
          type: "review_prompt",
          orderItem: item._id,
        });
        if (!existingNotification) {
          reviewNotifications.push({
            user: order.user,
            type: "review_prompt",
            title: "Review your purchase",
            message: `Your order has been delivered. Share your experience with ${item.productName}.`,
            link: `/products/${productId}`,
            order: order._id,
            orderItem: item._id,
          });
        }
      }

      if (reviewNotifications.length > 0) {
        await Notification.insertMany(reviewNotifications);
      }
    }

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
      "name price image category"
    );

    return res.status(200).json({
      success: true,
      data: populatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPaymentSession = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentMethod === 'cod') {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery orders do not require a payment session",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    const lineItems =
      order.discountAmount > 0 && order.finalAmount !== null
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: { name: `Order ${order._id}` },
                unit_amount: Math.round(order.finalAmount * 100),
              },
              quantity: 1,
            },
          ]
        : order.items.map((item) => ({
            price_data: {
              currency: "usd",
              product_data: { name: item.productName },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          }));

    const stripe = getStripeClient();
    const successUrl = new URL(
      process.env.STRIPE_SUCCESS_URL || "http://localhost:5173/payment/success"
    );
    successUrl.searchParams.set("orderId", order._id.toString());

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl.toString(),
      cancel_url:
        process.env.STRIPE_CANCEL_URL || "http://localhost:5173/payment/cancelled",
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    order.stripeCheckoutSessionId = session.id;
    order.paymentStatus = "unpaid";
    await order.save();

    return res.status(201).json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getManagedCancelledOrders = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let orderFilter = { status: "cancelled" };
    let sellerProductIds = [];

    if (role === "seller") {
      const sellerProducts = await Product.find({ seller: userId }).select("_id");
      sellerProductIds = sellerProducts.map((product) => product._id.toString());
      orderFilter = { ...orderFilter, "items.product": { $in: sellerProductIds } };
    }

    const orders = await Order.find(orderFilter)
      .populate("items.product", "name price image category seller")
      .sort({ createdAt: -1 });

    const filteredOrders = role === "seller"
      ? orders.map((order) => {
          const items = order.items.filter((item) => {
            const productId = item.product && typeof item.product === "object"
              ? item.product._id?.toString()
              : item.product?.toString();
            return productId && sellerProductIds.includes(productId);
          });

          return {
            ...order.toObject(),
            items,
            sellerRevenue: items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
          };
        })
      : orders;

    return res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden: you do not own this order" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled because it is already ${order.status}` });
    }

    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        const currentOrder = await Order.findById(orderId).session(dbSession);

        if (!currentOrder || currentOrder.status === "cancelled") {
          return;
        }

        const stockByProduct = new Map();
        for (const orderItem of currentOrder.items) {
          const productId = orderItem.product.toString();
          stockByProduct.set(
            productId,
            (stockByProduct.get(productId) || 0) + orderItem.quantity
          );
        }

        const stockOperations = Array.from(stockByProduct, ([product, quantity]) => ({
          updateOne: {
            filter: { _id: product },
            update: { $inc: { stock: quantity } },
          },
        }));

        if (stockOperations.length > 0) {
          const stockResult = await Product.bulkWrite(stockOperations, {
            session: dbSession,
          });

          if (stockResult.matchedCount !== stockOperations.length) {
            throw new Error("One or more order products no longer exist");
          }
        }

        currentOrder.status = "cancelled";
        await currentOrder.save({ session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
      "name price image category"
    );

    return res.status(200).json({
      success: true,
      data: populatedOrder,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ success: false, message: "Only delivered orders can be marked as paid" });
    }

    if (order.paymentMethod !== "cod") {
      return res.status(400).json({ success: false, message: "Only Cash on Delivery orders can be manually marked as paid" });
    }

    if (role === "seller") {
      const sellerProductIds = new Set(
        (await Product.find({ seller: userId }).select("_id")).map((product) => product._id.toString())
      );
      const hasSellerItem = order.items.some((item) => sellerProductIds.has(item.product.toString()));

      if (!hasSellerItem) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: order does not contain your products",
        });
      }
    }

    order.paymentStatus = "paid";
    order.paidAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
      "name price image category"
    );

    return res.status(200).json({
      success: true,
      data: populatedOrder,
      message: "Order marked as paid successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  getOrderReviewStatus,
  getManagedOrders,
  getManagedCancelledOrders,
  updateOrderStatus,
  createPaymentSession,
  cancelOrder,
  markOrderAsPaid,
};
