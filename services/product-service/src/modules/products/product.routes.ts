


// // services/product-service/src/modules/products/product.routes.ts
// import { Router } from "express";
// import * as productController from "./product.controller";
// import { authenticate, authorize } from "@repo/common"
// import { UserRole } from "@repo/types"

// const router = Router();

// router.route("/")
//   .get(productController.getAllProducts)
//   .post(
//     authenticate, 
//     // This now works because UserRole is an Enum (a value), not just a type
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.createProduct
//   );

// router.route("/:id")
//   .get(productController.getProductById)
//   .patch(
//     authenticate, 
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.updateProduct
//   )
//   .delete(
//     authenticate, 
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.deleteProduct
//   );

// router.patch(
//   "/:id/toggle-publish", 
//   authenticate, 
//   authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//   productController.togglePublishStatus
// );

// export default router;


// import { Router } from "express";
// import * as productController from "./product.controller.js"; // Ensure .js if using type: module
// import { authenticate, authorize } from "@repo/common";
// import { UserRole } from "@repo/types";

// const router = Router();

// // Routes for "/"
// router.route("/")
//   .get(productController.getAllProducts)
//   .post(
//     authenticate, 
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.createProduct
//   );

// // Routes for "/:id"
// router.route("/:id")
//   .get(productController.getProductById)
//   .patch(
//     authenticate, 
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.updateProduct
//   )
//   .delete(
//     authenticate, 
//     authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//     productController.deleteProduct
//   );

// // Toggle Publish Status
// router.patch(
//   "/:id/toggle-publish", 
//   authenticate, 
//   authorize([UserRole.VENDOR, UserRole.ADMIN]), 
//   productController.togglePublishStatus
// );

// export default router;





import { Router, Request, Response } from "express";
import * as productController from "./product.controller.js";
import { authenticate, authorize } from "@repo/common";
import { upload, uploadToImageKit } from "@repo/image-storage";
import { UserRole } from "@repo/types";
import reviewRoutes from "../reviews/review.routes.js";

const router = Router();

router.use("/:productId/reviews", reviewRoutes);

/**
 * @route   GET /api/v1/products
 * @desc    Fetch all products (paginated, filtered)
 * @access  Public
 * * @route   POST /api/v1/products
 * @desc    Create a new product with images
 * @access  Private (Vendor, Admin)
 */
router.route("/")
  .get(productController.getAllProducts)
  .post(
    authenticate, 
    authorize([UserRole.VENDOR, UserRole.ADMIN]),
    // Handles multipart form parsing for specific fields
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 4 }
    ]),
    // Processes buffers and uploads them to ImageKit
    uploadToImageKit, 
    productController.createProduct
  );

/**
 * @route   GET /api/v1/products/export
 * @desc    Export products as CSV
 * @access  Private (Vendor, Admin)
 */
router.get(
  "/export",
  authenticate,
  authorize([UserRole.VENDOR, UserRole.ADMIN]),
  productController.exportProducts
);

/**
 * @route   POST /api/v1/products/upload
 * @desc    Upload an image and get the URL
 * @access  Private (Vendor, Admin)
 */
router.post(
  "/upload",
  authenticate,
  authorize([UserRole.VENDOR, UserRole.ADMIN]),
  upload.single("image"),
  uploadToImageKit,
  (req, res) => {
    const fileData = (req as any).fileData;
    res.status(200).json({ success: true, url: fileData?.image?.[0]?.url });
  }
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 * * @route   PATCH /api/v1/products/:id
 * @desc    Update product details or images
 * @access  Private (Owner/Admin)
 * * @route   DELETE /api/v1/products/:id
 * @desc    Remove product and associated stock
 * @access  Private (Owner/Admin)
 */
router.route("/:id")
  .get(productController.getProductById)
  .patch(
    authenticate, 
    authorize([UserRole.VENDOR, UserRole.ADMIN]), 
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 4 }
    ]),
    uploadToImageKit,
    productController.updateProduct
  )
  .delete(
    authenticate, 
    authorize([UserRole.VENDOR, UserRole.ADMIN]), 
    productController.deleteProduct
  );

/**
 * @route   PATCH /api/v1/products/:id/toggle-publish
 * @desc    Switch between Draft and Published status
 * @access  Private (Owner/Admin)
 */
router.patch(
  "/:id/toggle-publish", 
  authenticate, 
  authorize([UserRole.VENDOR, UserRole.ADMIN]), 
  productController.togglePublishStatus
);

export default router;