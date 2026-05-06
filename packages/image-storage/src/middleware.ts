// // import multer from "multer";
// // import { Request, Response, NextFunction } from "express";
// // import { imagekit } from "./imagekit.config.js";
// // import logger from "@repo/logger";

// // // Standard Multer setup to handle file in memory
// // const storage = multer.memoryStorage();
// // export const upload = multer({ 
// //   storage,
// //   limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
// // });

// // export const uploadToImageKit = async (req: Request, res: Response, next: NextFunction) => {
// //   if (!req.file) return next();

// //   try {
// //     const response = await imagekit.upload({
// //       file: req.file.buffer, // The file buffer from multer
// //       fileName: `${Date.now()}-${req.file.originalname}`,
// //       folder: "/products" // You can make this dynamic if needed
// //     });

// //     // Attach the ImageKit data to the request object for the controller
// //     (req as any).fileData = {
// //       url: response.url,
// //       fileId: response.fileId,
// //       thumbnailUrl: response.thumbnailUrl
// //     };

// //     next();
// //   } catch (error: any) {
// //     logger.error({ err: error.message }, "ImageKit Upload Error");
// //     res.status(500).json({ message: "Image upload failed" });
// //   }
// // };




// import multer from "multer";
// import { Request, Response, NextFunction } from "express";
// import { imagekit } from "./imagekit.config.js";

// import logger from "@repo/logger"

// /**
//  * Configure Multer to use Memory Storage.
//  * This is better for microservices as it doesn't require persistent local disk space.
//  */
// const storage = multer.memoryStorage();
// export const upload = multer({ 
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
// });

// /**
//  * Helper to upload a single buffer to ImageKit
//  */
// const uploadSingleToIK = async (file: Express.Multer.File, folder: string) => {
//   console.log("ImageKit:", imagekit);
//   console.log("Upload fn:", typeof imagekit.upload);
//   const response = await imageKit.upload({
//     file: file.buffer,
//     fileName: `${Date.now()}-${file.originalname}`,
//     folder: folder
//   });
  
//   return {
//     url: response.url,
//     localPath: response.fileId // Using fileId as the reference for potential deletion later
//   };
// };

// /**
//  * middleware to process multiple image fields (mainImage & subImages)
//  */
// export const uploadToImageKit = async (req: Request, res: Response, next: NextFunction) => {
//   // If no files were uploaded, just move to the next middleware (controller)
//   if (!req.files) return next();

//   try {
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     const fileData: any = {
//       mainImage: [],
//       subImages: []
//     };

//     // 1. Process Main Image (expected as an array of 1 from multer)
//     if (files['mainImage'] && files['mainImage'].length > 0) {
//       const result = await uploadSingleToIK(files['mainImage'][0], "/products/main");
//       fileData.mainImage = [result]; // Array format to keep it consistent
//     }

//     // 2. Process Sub Images (expected as an array of multiple files)
//     if (files['subImages'] && files['subImages'].length > 0) {
//       const uploadPromises = files['subImages'].map(file => 
//         uploadSingleToIK(file, "/products/sub")
//       );
//       fileData.subImages = await Promise.all(uploadPromises);
//     }

//     // Attach processed data to the request object
//     (req as any).fileData = fileData;
    
//     next();
//   } catch (error: any) {
//     logger.error({ err: error.message }, "ImageKit Multi-Upload Error");
//     res.status(500).json({ 
//       success: false, 
//       message: "Failed to upload images to cloud storage" 
//     });
//   }
// };





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