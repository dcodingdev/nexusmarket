import { Request, Response, NextFunction } from "express";
import { getPppMultiplier } from "../utils/pppData.js";

// Extend the Request interface
declare global {
  namespace Express {
    interface Request {
      pppData?: {
        country: string;
        multiplier: number;
        discount: number;
      };
    }
  }
}

export const pppMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // 1. Try to get country code from headers
    // Vercel, Cloudflare, etc. often pass country in headers
    const country =
      (req.headers["x-vercel-ip-country"] as string) ||
      (req.headers["cf-ipcountry"] as string) ||
      (req.headers["x-country-code"] as string) || // Custom NGINX header
      "US"; // Default to US or no discount

    const multiplier = getPppMultiplier(country);
    
    // Calculate a display-friendly discount percentage (e.g., 0.6 multiplier = 40% discount)
    const discount = Math.round((1 - multiplier) * 100);

    // 2. Attach to request
    req.pppData = {
      country: country.toUpperCase(),
      multiplier,
      discount,
    };

    next();
  } catch (error) {
    // If anything fails, fail open (no discount)
    req.pppData = {
      country: "US",
      multiplier: 1.0,
      discount: 0,
    };
    next();
  }
};
