const Stripe = require("stripe");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
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
            const order = await Order.findOne({
              stripeCheckoutSessionId: session.id,
              paymentStatus: { $ne: "paid" },
            }).session(dbSession);

            if (!order) {
              return;
            }

            if (order.couponId && !order.couponUsageConsumed) {
              await consumeCouponUsage(order.couponId, dbSession);
              order.couponUsageConsumed = true;
            }

            order.paymentStatus = "paid";
            order.paidAt = new Date();
            if (session.payment_intent) {
              order.stripePaymentIntentId = session.payment_intent;
            }
            await order.save({ session: dbSession });

            const orderedProductIds = order.items.map((item) =>
              typeof item.product === "object" ? item.product._id : item.product
            );

            await Cart.findOneAndUpdate(
              { user: order.user },
              { $pull: { items: { product: { $in: orderedProductIds } } } }
            );
          });
        } finally {
          await dbSession.endSession();
        }
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;

      await Order.findOneAndUpdate(
        {
          stripeCheckoutSessionId: session.id,
          paymentStatus: { $ne: "paid" },
        },
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
