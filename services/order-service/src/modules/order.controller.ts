import { Request, Response } from "express";
import { Order } from "./order.model.js";
import { mongoose } from "@repo/database";
import axios from "axios";
import logger from "@repo/logger";

const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || "http://product-service:4002/api/stock";

export const createOrder = async (req: Request, res: Response) => {
  // Track successful reservations to roll back if a later item fails
  const reservedItems: string[] = [];

  try {
    const { items } = req.body; // items should match IOrderItem[] interface
    const userId = req.user?._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must have items" });
    }

    // 1. Calculate Total based on priceAtPurchase in schema
    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.priceAtPurchase * item.quantity,
      0
    );

    // 2. Create Order (Using 'customer' and 'orderStatus' from your schema)
    const order = await Order.create({
      customer: userId,
      items: items.map((item: any) => ({
        product: item.product,
        vendor: item.vendor,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
      totalAmount,
      orderStatus: "PENDING",
    });

    // 3. Try to Reserve Stock for each item
    try {
      for (const item of items) {
        await axios.post(`${STOCK_SERVICE_URL}/${item.product}/reserve`, {
          amount: item.quantity,
        });
        reservedItems.push(item.product); // Track for potential rollback
      }
    } catch (stockError: any) {
      // ROLLBACK LOGIC: Release already reserved items
      for (const productId of reservedItems) {
        const item = items.find((i: any) => i.product === productId);
        await axios.post(`${STOCK_SERVICE_URL}/${productId}/release`, {
          amount: item.quantity,
        }).catch((err: any) => logger.error(`Failed to rollback stock for ${productId}`));
      }

      // Update order status to CANCELLED
      order.orderStatus = "CANCELLED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Stock reservation failed. Order cancelled.",
        error: stockError.response?.data?.message || stockError.message,
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    logger.error({ err: error }, "Order creation failed");
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get My Orders
 * Updated to use 'customer' field from schema
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    // Using aggregatePaginate as defined in your model
    const query: any = {};
    if (userId) {
      query.customer = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    }
    const aggregate = Order.aggregate([{ $match: query }, { $sort: { createdAt: -1 } }]);

    const result = await (Order as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Order Details
 */
export const getOrderById = async (req: Request, res: Response) => {
    try {
      // Remove cross-service populates since Product and User models aren't present here
      const order = await Order.findById(req.params.id);
  
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error({ err: error }, "Failed to fetch order details");
      res.status(500).json({ success: false, message: error.message });
    }
  };

/**
 * Get Vendor Orders
 * Fetches orders that contain at least one item belonging to the vendor.
 */
export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    // Filter: at least one item has vendor matching vendorId
    const query: any = {};
    if (vendorId) {
      query["items.vendor"] = mongoose.Types.ObjectId.isValid(vendorId)
        ? new mongoose.Types.ObjectId(vendorId)
        : vendorId;
    }
    
    const aggregate = Order.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } }
    ]);

    const result = await (Order as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Order Item Status
 * Allows vendors to transition the status of their specific items.
 */
export const updateItemStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;
    const vendorId = req.user?._id;

    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Vendor ID missing" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const item = order.items.find(
      (i: any) => i.product.toString() === productId && i.vendor.toString() === vendorId.toString()
    );

    if (!item) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this item in this order" });
    }

    item.status = status;

    // Logic: If all items are DELIVERED, set global status to COMPLETED
    const allDelivered = order.items.every(i => i.status === "DELIVERED");
    if (allDelivered) {
      order.orderStatus = "COMPLETED";
    }

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get All Orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const aggregate = Order.aggregate([
      { $sort: { createdAt: -1 } }
    ]);

    const result = await (Order as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Verify Purchase
 * Checks if a user has a COMPLETED order containing a specific product.
 */
export const verifyPurchase = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    const order = await Order.findOne({
      customer: userId,
      "items.product": productId,
      $or: [
        { orderStatus: "COMPLETED" },
        { "items.status": "DELIVERED" } // Fallback for item-level status
      ]
    });

    res.status(200).json({ success: true, verified: !!order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};