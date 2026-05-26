// import { Request, Response } from "express";
// import { mongoose } from "@repo/database"; // Import mongoose to use Types.ObjectId
// import * as paymentService from "./payment.service";

// export const createPayment = async (req: Request, res: Response) => {
//   try {
//     const { orderId, amount, gateway } = req.body;
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // Explicitly cast strings to ObjectIds to satisfy the IPayment interface
//     const payment = await paymentService.processPaymentLogic({
//       orderId: new mongoose.Types.ObjectId(orderId),
//       customerId: new mongoose.Types.ObjectId(user._id),
//       amount,
//       gateway,
//     });

//     res.status(200).json({ success: true, data: payment });
//   } catch (error: any) {
//     // Handle cases where orderId string is not a valid ObjectId format
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


import { Payment } from "./payment.model.js";
import { Request, Response } from "express";
import { mongoose } from "@repo/database";
import * as paymentService from "./payment.service.js";
import { stripe } from "../../config/gateway.js";
import crypto from "node:crypto";

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { orderId, amount, gateway, currency = "USD" } = req.body;
  
  try {
    let gatewayResponse;
    if (gateway === "STRIPE") {
      gatewayResponse = await paymentService.createStripeIntent(amount, currency);
    } else {
      gatewayResponse = await paymentService.createRazorpayOrder(amount, currency);
    }

    const payment = await Payment.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      customerId: new mongoose.Types.ObjectId(req.user!._id),
      amount,
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

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as any;
    await paymentService.finalizePayment(intent.id);
  }

  res.json({ received: true });
};

// RAZORPAY WEBHOOK
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature === expectedSignature) {
    if (req.body.event === "order.paid") {
      await paymentService.finalizePayment(req.body.payload.payment.entity.order_id);
    }
    res.status(200).send("OK");
  } else {
    res.status(400).send("Invalid Signature");
  }
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