import { Router } from "express";
import * as stockController from "./stock.controller.js";
import { validateRequest } from "@repo/common";
import { UpdateStockSchema, ReserveStockSchema } from "@repo/api-contracts";

const router = Router();

// Vendor endpoints
router.patch(
  "/:productId/inventory", 
  validateRequest({ body: UpdateStockSchema }),
  stockController.updatePhysicalStock
);

// Batch endpoints for atomic operations
router.post("/batch/reserve", stockController.batchReserveStock);
router.post("/batch/confirm", stockController.batchConfirmSale);
router.post("/batch/release", stockController.batchReleaseReservation);

// Transactional endpoints (Usually called via RabbitMQ or Internal API)
router.post(
  "/:productId/reserve", 
  validateRequest({ body: ReserveStockSchema }),
  stockController.reserveStock
);
router.post("/:productId/confirm", stockController.confirmSale);
router.post("/:productId/release", stockController.releaseReservation);


export default router;