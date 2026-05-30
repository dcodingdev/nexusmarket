import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { imagekit } from "./imagekit.config.js";
import logger from "@repo/logger";

/**
 * Multer Memory Storage
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

/**
 * Upload single file to ImageKit (v3 SDK)
 */
const uploadSingleToIK = async (
  file: Express.Multer.File,
  folder: string
) => {
  try {
    const response = await imagekit.files.upload({
      file: file.buffer.toString("base64"), // ✅ REQUIRED
      fileName: `${Date.now()}-${file.originalname}`,
      folder,
    });

    return {
      url: response.url,
      localPath: response.fileId,
    };
  } catch (error: any) {
    logger.error(`Image upload failed: ${error.message}`);
    throw error;
  }
};

/**
 * Middleware for multiple image upload
 */
export const uploadToImageKit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files && !req.file) return next();

  try {
    const fileData: any = {
      mainImage: [],
      subImages: [],
    };

    /**
     * Handle Single File (req.file)
     */
    if (req.file) {
      const result = await uploadSingleToIK(req.file, "/uploads");
      (req as any).fileData = {
        ...fileData,
        [req.file.fieldname]: [result],
      };
      return next();
    }

    /**
     * Handle Multiple Files (req.files)
     */
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    /**
     * MAIN IMAGE
     */
    if (files["mainImage"]?.length > 0) {
      const result = await uploadSingleToIK(
        files["mainImage"][0],
        "/products/main"
      );
      fileData.mainImage = [result];
    }

    /**
     * SUB IMAGES
     */
    if (files["subImages"]?.length > 0) {
      const uploadPromises = files["subImages"].map((file) =>
        uploadSingleToIK(file, "/products/sub")
      );

      fileData.subImages = await Promise.all(uploadPromises);
    }

    /**
     * Attach to request
     */
    (req as any).fileData = fileData;

    next();

  } catch (error: any) {
    logger.error(
      `ImageKit Multi-Upload Error: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message: "Failed to upload images",
    });
  }
};