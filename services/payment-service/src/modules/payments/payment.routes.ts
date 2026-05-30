import { Router } from "express";
import * as paymentController from "./payment.controller.js";
// ✅ Clean import from shared common package
import { authenticate, validateRequest } from "@repo/common";
import { CreatePaymentSessionSchema } from "@repo/api-contracts";

import { pppMiddleware } from "../../middleware/ppp.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/payments/process
 * @desc    Process a transaction (requires valid JWT)
 * @access  Private (All authenticated users)
 */
router.route("/process")
  .post(
    authenticate, 
    pppMiddleware,
    validateRequest({ body: CreatePaymentSessionSchema }),
    paymentController.createPaymentSession
  );

router.route("/mock-confirm")
  .post(
    authenticate,
    paymentController.confirmMockPayment
  );

// Optional: Webhook route (usually public, no authenticate middleware)
// router.route("/webhook").post(paymentController.handleStripeWebhook);

export default router;