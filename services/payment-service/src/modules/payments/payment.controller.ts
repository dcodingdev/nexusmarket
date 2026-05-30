import { Payment } from "./payment.model.js";
import { Request, Response } from "express";
import { mongoose } from "@repo/database";
import * as paymentService from "./payment.service.js";
import { stripe } from "../../config/gateway.js";
import crypto from "node:crypto";

export const createPaymentSession = async (req: Request, res: Response) => {
  const { orderId, amount, gateway, currency = "USD" } = req.body;
  
  // Apply PPP discount if available
  let finalAmount = amount;
  let appliedMultiplier = 1.0;

  if (req.pppData && req.pppData.multiplier < 1.0) {
    appliedMultiplier = req.pppData.multiplier;
    finalAmount = Math.round(amount * appliedMultiplier);
  }

  try {
    let gatewayResponse;
    if (gateway === "STRIPE") {
      gatewayResponse = await paymentService.createStripeSession(finalAmount, currency, orderId, req.user!._id.toString());
    } else {
      // Fallback to Stripe if paypal/other isn't implemented yet, or throw error
      throw new Error(`Gateway ${gateway} is not implemented`);
    }

    const payment = await Payment.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      customerId: new mongoose.Types.ObjectId(req.user!._id),
      amount: finalAmount, // Store the discounted amount
      gateway,
      transactionId: gatewayResponse.id,
      status: "PENDING",
    });

    res.status(200).json({ success: true, gatewayData: gatewayResponse, paymentId: payment._id });
  } catch (error: any) {
    console.error("PAYMENT ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: error?.error?.description || error?.message || "Gateway Authentication Failed"
    });
  }
};

// STRIPE WEBHOOK
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    // USE req.rawBody HERE!
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    await paymentService.finalizePayment(session.id);
  }

  res.json({ received: true });
};


// CONFIRM MOCK PAYMENT
export const confirmMockPayment = async (req: Request, res: Response) => {
  const { transactionId } = req.body;
  try {
    await paymentService.finalizePayment(transactionId);
    res.status(200).json({ success: true, message: "Mock payment confirmed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};