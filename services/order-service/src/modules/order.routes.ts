import { Router } from "express";
import * as orderController from "./order.controller.js";
import { authorize, authenticate } from "@repo/common"
import { UserRole } from "@repo/types";

const router = Router();

/**
 * Global Middleware: All order operations require a logged-in user
 */
router.use(authenticate);

router.route("/")
  /**
   * @route   POST /api/v1/orders
   * @desc    Place a new order & reserve stock
   * @access  Private (All Roles)
   */
  .post(orderController.createOrder);

router.route("/me")
  /**
   * @route   GET /api/v1/orders/me
   * @desc    Get logged-in user's order history
   * @access  Private (All Roles)
   */
  .get(orderController.getMyOrders);

router.route("/vendor")
  /**
   * @route   GET /api/v1/orders/vendor
   * @desc    Get orders containing vendor's items
   * @access  Private (Vendor)
   */
  .get(authorize([UserRole.VENDOR]), orderController.getVendorOrders);

router.route("/:orderId/items/:productId/status")
  /**
   * @route   PATCH /api/v1/orders/:orderId/items/:productId/status
   * @desc    Update status of a specific item (for vendors)
   * @access  Private (Vendor)
   */
  .patch(authorize([UserRole.VENDOR]), orderController.updateItemStatus);

router.route("/verify-purchase/:productId")
  /**
   * @route   GET /api/v1/orders/verify-purchase/:productId
   * @desc    Check if the user has purchased this product
   * @access  Private (All Roles)
   */
  .get(orderController.verifyPurchase);

/**
 * Optional: Admin-only route to see all orders across the platform
 */
router.route("/all")
  .get(
    authorize([UserRole.ADMIN]),
    orderController.getAllOrders 
  );

router.route("/:id")
  /**
   * @route   GET /api/v1/orders/:id
   * @desc    Get details of a specific order
   * @access  Private (Owner or Admin)
   */
  .get(orderController.getOrderById);

export default router;