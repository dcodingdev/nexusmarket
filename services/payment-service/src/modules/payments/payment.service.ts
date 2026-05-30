import { stripe } from "../../config/gateway.js";
import { Payment } from "./payment.model.js";
import { publishEvent, RMQ_NAMES } from "@repo/rabbitmq";
import crypto from "crypto";
import logger from "@repo/logger";

export const createStripeSession = async (amount: number, currency: string, orderId: string, customerId: string) => {
  try {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Order ' + orderId,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?payment_intent={CHECKOUT_SESSION_ID}&redirect_status=succeeded&gateway=STRIPE`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout`,
      metadata: { orderId, customerId },
    });
  } catch (error: any) {
    logger.warn({ err: error.message || error, code: error.code, type: error.type }, "Stripe API failed or keys missing, using mock response");
    return { id: `session_mock_${Date.now()}`, url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/mock-checkout`, amount: Math.round(amount * 100), currency };
  }
};

export const finalizePayment = async (transactionId: string) => {
  const payment = await Payment.findOne({ transactionId });

  if (!payment || payment.status === "COMPLETED") return;

  payment.status = "COMPLETED";
  await payment.save();

  // Notify Order & Stock Services
  await publishEvent(
    RMQ_NAMES.getExchange("payment", "payment", "topic"),
    "payment.success",
    {
      event: "payment.success.v1",
      data: {
        orderId: payment.orderId,
        paymentId: payment._id,
        amount: payment.amount,
      },
      meta: {
        messageId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: "payment-service",
        version: 1,
      },
    }
  );
  
  logger.info({ orderId: payment.orderId }, "💳 Payment Finalized & Event Published");
};