


// import { Request, Response } from "express";
// import { Product } from "./product.model";
// import logger from "@repo/logger";
// import { Stock } from "../stock/stock.model";
// import { publishEvent, RMQ_NAMES } from "@repo/rabbitmq";
// import { UserRole } from "@repo/types";
// import crypto from "crypto";

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

//     // 1. Create Product
//     const product = await Product.create({
//       ...req.body,
//       vendor: { id: user._id, name: user.name },
//     });

//     // 2. Initialize Stock
//     await Stock.create({
//       productId: product._id,
//       vendorId: user._id,
//       quantity: 0,
//       reservedQuantity: 0,
//     });

//     // 3. Notify downstream services
//     await publishEvent(
//       RMQ_NAMES.getExchange("product", "product", "topic"),
//       "product.created",
//       {
//         event: "product.created.v1",
//         data: { id: product._id, name: product.name, vendorId: user._id },
//         meta: {
//           messageId: crypto.randomUUID(),
//           timestamp: new Date().toISOString(),
//           source: "product-service",
//           version: 1,
//         },
//       }
//     );

//     res.status(201).json({ success: true, data: product });
//   } catch (error: any) {
//     logger.error({ err: error }, "Create product failed");
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const getAllProducts = async (req: Request, res: Response) => {
//   try {
//     const { page = 1, limit = 10, category, vendor, search } = req.query;
//     const query: any = { isDraft: false };

//     if (category) query.category = category;
//     if (vendor) query["vendor.id"] = vendor;
//     if (search) query.name = { $regex: search, $options: "i" };

//     const aggregate = Product.aggregate([{ $match: query }]);
//     const result = await (Product as any).aggregatePaginate(aggregate, {
//       page: Number(page),
//       limit: Number(limit),
//       sort: { createdAt: -1 },
//     });

//     res.status(200).json({ success: true, ...result });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id).populate("category");
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     res.status(200).json({ success: true, data: product });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Not found" });

//     const isOwner = product.vendor.id.toString() === req.user?._id;
//     const isAdmin = req.user?.role === UserRole.ADMIN;

//     if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Forbidden" });

//     const { vendor, ...updateData } = req.body; // Prevent vendor hijacking
//     Object.assign(product, updateData);
//     await product.save();

//     res.status(200).json({ success: true, data: product });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const deleteProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Not found" });

//     if (product.vendor.id.toString() !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     await Promise.all([
//       product.deleteOne(),
//       Stock.deleteOne({ productId: req.params.id })
//     ]);

//     res.status(200).json({ success: true, message: "Product deleted" });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const togglePublishStatus = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Not found" });

//     if (product.vendor.id.toString() !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     product.isDraft = !product.isDraft;
//     await product.save();

//     res.status(200).json({ success: true, data: product });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };










// import { Request, Response } from "express";
// import { Product } from "./product.model.js";
// import logger from "@repo/logger";
// import { Stock } from "../stock/stock.model.js";
// import { publishEvent, RMQ_NAMES } from "@repo/rabbitmq";
// import { UserRole } from "@repo/types";
// import crypto from "crypto";

// /**
//  * CREATE PRODUCT
//  * Handles file data from ImageKit and initializes Stock
//  */
// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

//     // Extract images processed by the uploadToImageKit middleware
//     const fileData = (req as any).fileData;

//     const mainImage = fileData?.mainImage?.[0] || { url: "", localPath: "" };
//     const subImages = fileData?.subImages || [];

//     // 1. Create Product with Vendor Snapshot
//     const product = await Product.create({
//       ...req.body,
//       vendor: { id: user._id, name: user.name },
//       mainImage,
//       subImages,
//     });

//     // 2. Initialize Stock Document
//     // Defaulting to 0, or taking initial stock from body if provided
//     await Stock.create({
//       productId: product._id,
//       vendorId: user._id,
//       quantity: req.body.initialStock || 0,
//       reservedQuantity: 0,
//     });

//     // 3. Notify downstream services (Search, Analytics, etc.)
//     await publishEvent(
//       RMQ_NAMES.getExchange("product", "product", "topic"),
//       "product.created",
//       {
//         event: "product.created.v1",
//         data: { 
//           id: product._id, 
//           name: product.name, 
//           vendorId: user._id, 
//           price: product.price 
//         },
//         meta: {
//           messageId: crypto.randomUUID(),
//           timestamp: new Date().toISOString(),
//           source: "product-service",
//         },
//       }
//     );

//     res.status(201).json({ success: true, data: product });
//   } catch (error: any) {
//     logger.error({ err: error }, "Create product failed");
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// /**
//  * GET ALL PRODUCTS
//  * Supports Pagination, Category filter, and Search
//  */
// export const getAllProducts = async (req: Request, res: Response) => {
//   try {
//     const { page = 1, limit = 10, category, vendor, search } = req.query;
//     const query: any = { isDraft: false };

//     if (category) query.category = category;
//     if (vendor) query["vendor.id"] = vendor;
//     if (search) query.name = { $regex: search, $options: "i" };

//     const aggregate = Product.aggregate([{ $match: query }]);
    
//     // aggregatePaginate is a plugin on the Product model
//     const result = await (Product as any).aggregatePaginate(aggregate, {
//       page: Number(page),
//       limit: Number(limit),
//       sort: { createdAt: -1 },
//     });

//     res.status(200).json({ success: true, ...result });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * GET PRODUCT BY ID
//  */
// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id).populate("category");
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     res.status(200).json({ success: true, data: product });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * UPDATE PRODUCT
//  * Includes Ownership check and partial image update logic
//  */
// export const updateProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     // Authorization: Only owner or admin
//     const isOwner = product.vendor.id.toString() === req.user?._id;
//     const isAdmin = req.user?.role === UserRole.ADMIN;
//     if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Forbidden" });

//     const fileData = (req as any).fileData;
//     const { vendor, ...updateData } = req.body; // Prevent overwriting vendor data via body

//     // Update images if new ones were uploaded
//     if (fileData?.mainImage) updateData.mainImage = fileData.mainImage[0];
//     if (fileData?.subImages) updateData.subImages = fileData.subImages;

//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({ success: true, data: updatedProduct });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// /**
//  * DELETE PRODUCT
//  * Cascades to delete associated Stock
//  */
// export const deleteProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     const isOwner = product.vendor.id.toString() === req.user?._id;
//     const isAdmin = req.user?.role === UserRole.ADMIN;
//     if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Forbidden" });

//     // Cleanup: Delete product and stock in parallel
//     await Promise.all([
//       product.deleteOne(),
//       Stock.deleteOne({ productId: req.params.id })
//     ]);

//     // Optional: Add logic to delete images from ImageKit here using imagekit.deleteFile()

//     res.status(200).json({ success: true, message: "Product deleted successfully" });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * TOGGLE PUBLISH STATUS
//  */
// export const togglePublishStatus = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     const isOwner = product.vendor.id.toString() === req.user?._id;
//     const isAdmin = req.user?.role === UserRole.ADMIN;
//     if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Unauthorized" });

//     product.isDraft = !product.isDraft;
//     await product.save();

//     res.status(200).json({ success: true, data: product });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


import { Request, Response } from "express";
import { mongoose } from "@repo/database";
import { Product } from "./product.model.js";
import logger from "@repo/logger";
import { Stock } from "../stock/stock.model.js";
import { publishEvent, RMQ_NAMES } from "@repo/rabbitmq";
import { UserRole } from "@repo/types";
import crypto from "node:crypto";

/**
 * Helper for consistent route logging
 */
const logRoute = (req: Request) => `${req.method} ${req.originalUrl}`;

/**
 * CREATE PRODUCT
 */
export const createProduct = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const user = req.user;
    if (!user) {
      logger.warn(`${route} - Unauthorized`);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const fileData = (req as any).fileData;

    // Handle both direct multipart upload and pre-uploaded URL from frontend
    const mainImage = fileData?.mainImage?.[0] || 
                     (req.body.imageUrl ? { url: req.body.imageUrl, localPath: "pre-uploaded" } : { url: "", localPath: "" });
    
    const subImages = fileData?.subImages || [];

    logger.debug({ body: req.body, mainImage }, "Creating product with data");

    const product = await Product.create({
      ...req.body,
      vendor: { id: user._id, name: user.name },
      mainImage,
      subImages,
    });


    await Stock.create({
      productId: product._id,
      vendorId: user._id,
      quantity: req.body.initialStock || 0,
      reservedQuantity: 0,
    });

    await publishEvent(
      RMQ_NAMES.getExchange("product", "product", "topic"),
      "product.created",
      {
        event: "product.created.v1",
        data: {
          id: product._id,
          name: product.name,
          vendorId: user._id,
          price: product.price,
        },
        meta: {
          messageId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          source: "product-service",
        },
      }
    );

    logger.info(`${route} - Product created: ${product._id}`);

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    logger.error(`${route} - Create failed: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL PRODUCTS
 */
export const getAllProducts = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const { page = 1, limit = 10, category, vendor, search } = req.query;
    const query: any = { isDraft: false };

    if (category) query.category = category;
    if (vendor) {
      query["vendor.id"] = mongoose.Types.ObjectId.isValid(vendor as string)
        ? new mongoose.Types.ObjectId(vendor as string)
        : vendor;
    }
    if (search) query.name = { $regex: search, $options: "i" };

    const aggregate = Product.aggregate([{ $match: query }]);

    const result = await (Product as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
    });

    logger.info(`${route} - Fetched ${result.docs.length} products`);

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error(`${route} - Fetch failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET VENDOR PRODUCTS
 */
export const getVendorProducts = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (req.user?.role !== UserRole.ADMIN && req.user?._id !== vendorId) {
      logger.warn(`${route} - Unauthorized attempt by user ${req.user?._id} to access products of vendor ${vendorId}`);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(vendorId)) {
      query["vendor.id"] = new mongoose.Types.ObjectId(vendorId);
    } else {
      query["vendor.id"] = vendorId;
    }

    const aggregate = Product.aggregate([{ $match: query }]);

    const result = await (Product as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
    });

    logger.info(`${route} - Fetched ${result.docs.length} products for vendor ${vendorId}`);

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error(`${route} - Fetch vendor products failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET PRODUCT BY ID
 */
export const getProductById = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);
    const product = await Product.findById(req.params.id);

    if (!product) {
      logger.warn(`${route} - Product not found`);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    logger.info(`${route} - Product fetched`);

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    logger.error(`${route} - Fetch failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE PRODUCT
 */
export const updateProduct = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const product = await Product.findById(req.params.id);

    if (!product) {
      logger.warn(`${route} - Product not found`);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.vendor.id.toString() === req.user?._id;
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      logger.warn(`${route} - Unauthorized update attempt`);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const fileData = (req as any).fileData;
    const { vendor, ...updateData } = req.body;

    if (fileData?.mainImage) {
      updateData.mainImage = fileData.mainImage[0];
    } else if (req.body.imageUrl) {
      updateData.mainImage = { url: req.body.imageUrl, localPath: "pre-uploaded" };
    }

    if (fileData?.subImages) updateData.subImages = fileData.subImages;


    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    logger.info(`${route} - Product updated`);

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error: any) {
    logger.error(`${route} - Update failed: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE PRODUCT
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const product = await Product.findById(req.params.id);

    if (!product) {
      logger.warn(`${route} - Product not found`);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.vendor.id.toString() === req.user?._id;
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      logger.warn(`${route} - Unauthorized delete attempt`);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await Promise.all([
      product.deleteOne(),
      Stock.deleteOne({ productId: req.params.id }),
    ]);

    logger.info(`${route} - Product deleted`);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    logger.error(`${route} - Delete failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TOGGLE PUBLISH STATUS
 */
export const togglePublishStatus = async (req: Request, res: Response) => {
  const route = logRoute(req);

  try {
    logger.info(route);

    const product = await Product.findById(req.params.id);

    if (!product) {
      logger.warn(`${route} - Product not found`);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.vendor.id.toString() === req.user?._id;
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      logger.warn(`${route} - Unauthorized`);
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    product.isDraft = !product.isDraft;
    await product.save();

    logger.info(`${route} - Publish status toggled`);

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    logger.error(`${route} - Toggle failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * EXPORT PRODUCTS AS CSV
 */
export const exportProducts = async (req: Request, res: Response) => {
  const route = logRoute(req);
  try {
    logger.info(route);

    // Only allow vendors to export their own products, or admins to export any
    let vendorId = req.query.vendorId as string;
    const ids = req.query.ids as string | string[];

    const isAdmin = req.user?.role === UserRole.ADMIN;
    const isVendor = req.user?.role === UserRole.VENDOR;

    if (!vendorId && isVendor) {
      vendorId = req.user?._id as string;
    }

    if (!isAdmin && isVendor && vendorId !== req.user?._id) {
      logger.warn(`${route} - Unauthorized export attempt`);
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const query: any = {};
    if (vendorId) query["vendor.id"] = vendorId;
    if (ids) {
      query._id = { $in: Array.isArray(ids) ? ids : [ids] };
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    const headers = [
      "_id",
      "name",
      "sku",
      "category",
      "price",
      "isDraft",
      "mainImage",
      "subImages",
      "createdAt"
    ];

    const rows = products.map((p: any) => {
      const row = [
        p._id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku || "",
        p.category || "",
        p.price,
        p.isDraft,
        p.mainImage?.url || "",
        (p.subImages || []).map((img: any) => img.url).join(";"),
        p.createdAt ? new Date(p.createdAt).toISOString() : ""
      ];
      return row.join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    logger.info(`${route} - Exported ${products.length} products`);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=products-${vendorId || "all"}-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error: any) {
    logger.error(`${route} - Export failed: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};