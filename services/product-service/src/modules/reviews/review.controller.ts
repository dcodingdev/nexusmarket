import { Request, Response } from "express";
import { Review } from "./review.model.js";
import { Product } from "../products/product.model.js";
import logger from "@repo/logger";

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://order-service:4003/api/orders";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user?._id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Verify Product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Verify Purchase (Call order-service)
    let isVerified = false;
    try {
      // Forward the auth header so the order service knows who is asking
      const authHeader = req.headers.authorization || (req.cookies?.accessToken ? `Bearer ${req.cookies.accessToken}` : undefined);
      
      const verifyRes = await fetch(`${ORDER_SERVICE_URL}/verify-purchase/${productId}`, {
        headers: {
          ...(authHeader && { Authorization: authHeader })
        }
      });
      
      const data = await verifyRes.json();
      isVerified = data?.verified === true;
    } catch (error: any) {
      logger.error({ err: error.message }, "Failed to verify purchase with order-service");
      return res.status(403).json({ 
        success: false, 
        message: "You must have a completed order for this product to leave a review." 
      });
    }

    if (!isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "You must have a completed order for this product to leave a review." 
      });
    }

    // 3. Create Review
    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, customer: customerId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product." });
    }

    const review = await Review.create({
      product: productId,
      customer: customerId,
      rating,
      comment,
      isVerified: true // Set to true since we verified it
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to create review");
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { product: new (require("mongoose")).Types.ObjectId(productId) };
    const aggregate = Review.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } }
    ]);

    const result = await (Review as any).aggregatePaginate(aggregate, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to fetch reviews");
    res.status(500).json({ success: false, message: error.message });
  }
};
