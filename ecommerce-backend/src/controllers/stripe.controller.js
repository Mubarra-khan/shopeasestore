const Stripe = require("stripe");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { consumeCouponUsage } = require("./coupon.controller");

const handleStripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return res.status(500).json({
      success: false,
      message: "Stripe webhook secret not configured",
    });
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Webhook request body must be raw",
    });
  }

  let event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      webhookSecret
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Webhook signature verification failed: ${error.message}`,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const dbSession = await mongoose.startSession();
        try {
          await dbSession.withTransaction(async () => {
            const existingOrder = await Order.findOne({ stripeCheckoutSessionId: session.id }).session(dbSession);
            if (existingOrder) {
              return;
            }

            const { userId, items, shippingAddress, couponCode, discountAmount, finalAmount, totalAmount } = session.metadata;

            if (!userId || !items || !shippingAddress) {
              return;
            }

            const parsedItems = JSON.parse(items);
            const parsedShipping = JSON.parse(shippingAddress);
            const parsedDiscount = Number(discountAmount) || 0;
            const parsedFinal = Number(finalAmount) || 0;
            const parsedTotal = Number(totalAmount) || 0;

            const orderItems = [];
            for (const selected of parsedItems) {
              const productId = selected.productId;
              const quantity = Number(selected.quantity) || 1;
              const product = await Product.findById(productId).session(dbSession);

              if (product) {
                const actualQty = Math.min(quantity, product.stock);
                const subtotal = product.price * actualQty;

                orderItems.push({
                  product: product._id,
                  productName: product.name,
                  price: product.price,
                  quantity: actualQty,
                  subtotal,
                });
              } else {
                orderItems.push({
                  product: new mongoose.Types.ObjectId(productId),
                  productName: selected.productName || "Unknown product",
                  price: Number(selected.price) || 0,
                  quantity,
                  subtotal: (Number(selected.price) || 0) * quantity,
                });
              }
            }

            if (orderItems.length === 0) {
              return;
            }

            let couponData = null;
            if (couponCode) {
              couponData = await findUsableCoupon(couponCode, parsedTotal);
            }

            const createdOrder = new Order({
              user: userId,
              items: orderItems,
              totalAmount: parsedTotal,
              couponCode: couponData ? couponData.coupon.code : null,
              couponId: couponData ? couponData.coupon._id : null,
              discountAmount: parsedDiscount,
              finalAmount: parsedFinal,
              status: "pending",
              shippingAddress: parsedShipping,
              paymentMethod: "stripe",
              stripeCheckoutSessionId: session.id,
              paymentStatus: "paid",
              paidAt: new Date(),
              stripePaymentIntentId: session.payment_intent || null,
            });
            await createdOrder.save({ session: dbSession });

            const existingProductIds = [];
            for (const orderItem of orderItems) {
              if (mongoose.Types.ObjectId.isValid(orderItem.product) && await Product.findById(orderItem.product).session(dbSession)) {
                await Product.findByIdAndUpdate(
                  orderItem.product,
                  { $inc: { stock: -orderItem.quantity } },
                  { new: true, session: dbSession }
                );
                existingProductIds.push(orderItem.product);
              }
            }

            if (existingProductIds.length > 0) {
              await Cart.findOneAndUpdate(
                { user: userId },
                { $pull: { items: { product: { $in: existingProductIds } } } },
                { session: dbSession }
              );
            }

            if (couponData && !createdOrder.couponUsageConsumed) {
              await consumeCouponUsage(couponData.coupon._id, dbSession);
              createdOrder.couponUsageConsumed = true;
              await createdOrder.save({ session: dbSession });
            }
          });
        } finally {
          await dbSession.endSession();
        }
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;

      const failedOrder = await Order.findOne({ stripeCheckoutSessionId: session.id });
      if (!failedOrder) {
        return res.status(200).json({ received: true });
      }

      await Order.findOneAndUpdate(
        { _id: failedOrder._id, paymentStatus: { $ne: "paid" } },
        { $set: { paymentStatus: "failed" } }
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = { handleStripeWebhook };
