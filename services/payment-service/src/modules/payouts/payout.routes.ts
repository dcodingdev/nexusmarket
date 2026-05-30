import { Router } from "express";
import * as payoutController from "./payout.controller.js";
import { authenticate, authorize, validateRequest } from "@repo/common";
import { UserRole } from "@repo/types";
import { RequestPayoutSchema } from "@repo/api-contracts";

const router = Router();

router.route("/request")
  .post(
    authenticate, 
    authorize([UserRole.VENDOR]), 
    validateRequest({ body: RequestPayoutSchema }),
    payoutController.requestPayout
  );

export default router;