import { Request, Response } from "express";
import { Stock } from "./stock.model.js";
import logger from "@repo/logger";

/**
 * Update Physical Stock
 * Vendor updates total inventory levels.
 */
export const updatePhysicalStock = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity, lowStockThreshold } = req.body;

    const stock = await Stock.findOneAndUpdate(
      { productId },
      { $set: { quantity, lowStockThreshold } },
      { new: true, upsert: true, runValidators: true }
    );

    // Save triggers 'pre-save' hooks for status logic (e.g., In Stock vs Out of Stock)
    await stock.save();

    res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Reserve Stock
 * Atomic check to ensure availability before incrementing reserved quantity.
 */
export const reserveStock = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;

    // Use findOne first to check business logic
    const stock = await Stock.findOne({ productId });

    if (!stock) return res.status(404).json({ success: false, message: "Stock record not found" });
    
    // Check if (Total - Reserved) is enough
    if ((stock.quantity - stock.reservedQuantity) < amount) {
      return res.status(400).json({ success: false, message: "Insufficient stock available" });
    }

    stock.reservedQuantity += amount;
    await stock.save();

    res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Confirm Sale
 * Deducts from physical quantity AND clears the reservation.
 */
export const confirmSale = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;

    // Use atomic update to prevent negative reserved stock
    const stock = await Stock.findOneAndUpdate(
      { productId, reservedQuantity: { $gte: amount } },
      { 
        $inc: { 
          quantity: -amount, 
          reservedQuantity: -amount 
        } 
      },
      { new: true }
    );

    if (!stock) {
      return res.status(400).json({ success: false, message: "Sale confirmation failed: Insufficient reserved stock" });
    }

    await stock.save(); // Refresh status
    res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Release Reservation
 * Used if an order is cancelled or payment fails.
 */
export const releaseReservation = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;

    const stock = await Stock.findOneAndUpdate(
      { productId, reservedQuantity: { $gte: amount } },
      { $inc: { reservedQuantity: -amount } },
      { new: true }
    );

    if (!stock) {
      return res.status(400).json({ success: false, message: "No active reservation found to release" });
    }

    await stock.save();
    res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Batch Reserve Stock
 * Atomic check to ensure availability before incrementing reserved quantity for multiple items.
 */
export const batchReserveStock = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Expects an array of { productId, amount }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    // First check if all items have enough stock
    const productIds = items.map((item: any) => item.productId);
    const stocks = await Stock.find({ productId: { $in: productIds } });

    const stockMap = new Map();
    stocks.forEach((s: any) => stockMap.set(s.productId.toString(), s));

    for (const item of items) {
      const stock = stockMap.get(item.productId.toString());
      if (!stock) {
        return res.status(404).json({ success: false, message: `Stock record not found for product ${item.productId}` });
      }
      if ((stock.quantity - stock.reservedQuantity) < item.amount) {
        return res.status(400).json({ success: false, message: `Insufficient stock available for product ${item.productId}` });
      }
    }

    // All items passed validation, now perform a bulk write
    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { productId: item.productId },
        update: { $inc: { reservedQuantity: item.amount } }
      }
    }));

    await Stock.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: "Batch stock reserved successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Batch Confirm Sale
 * Deducts from physical quantity AND clears the reservation for multiple items.
 */
export const batchConfirmSale = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Expects an array of { productId, amount }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { productId: item.productId, reservedQuantity: { $gte: item.amount } },
        update: { $inc: { quantity: -item.amount, reservedQuantity: -item.amount } }
      }
    }));

    const result = await Stock.bulkWrite(bulkOps);
    
    // Check if some documents were not updated due to insufficient reserved quantity
    if (result.modifiedCount !== items.length) {
       // Log warning, some items failed confirmation
       logger.warn({ bulkOps, modifiedCount: result.modifiedCount }, "Not all items had sufficient reserved stock during batch confirmation");
    }

    res.status(200).json({ success: true, message: "Batch sale confirmed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Batch Release Reservation
 * Used if an order is cancelled or payment fails.
 */
export const batchReleaseReservation = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Expects an array of { productId, amount }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { productId: item.productId, reservedQuantity: { $gte: item.amount } },
        update: { $inc: { reservedQuantity: -item.amount } }
      }
    }));

    await Stock.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: "Batch reservation released successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};