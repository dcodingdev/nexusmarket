import { Router } from "express";
import * as paymentController from "./payment.controller.js";
// ✅ Clean import from shared common package
import { authenticate } from "@repo/common";

const router = Router();

/**
 * @route   POST /api/v1/payments/process
 * @desc    Process a transaction (requires valid JWT)
 * @access  Private (All authenticated users)
 */
router.route("/process")
  .post(
    authenticate, 
    paymentController.createPaymentIntent
  );

router.route("/mock-confirm")
  .post(
    authenticate,
    paymentController.confirmMockPayment
  );

// Optional: Webhook route (usually public, no authenticate middleware)
// router.route("/webhook").post(paymentController.handleStripeWebhook);

export default router;