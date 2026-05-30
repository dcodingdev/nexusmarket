import { env } from '../config/env.js';
import jwt from "jsonwebtoken";
import type { TypedServer } from "./socket.types";
import logger from "@repo/logger";

export function applySocketAuth(io: TypedServer): void {
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers["authorization"] as string);

    if (!token) {
      logger.warn("Socket handshake failed: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    const cleanToken = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    try {
      const secret = env.JWT_ACCESS_SECRET;
      if (!secret) {
        logger.error("Socket handshake failed: JWT secret missing");
        return next(new Error("Server configuration error: JWT secret missing"));
      }

      const decoded = jwt.verify(cleanToken, secret) as {
        _id: string;
        email: string;
        role: string;
      };

      socket.data.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

      logger.info({ userId: decoded._id }, "Socket handshake successful");
      next();
    } catch (err: any) {
      logger.warn({ err: err.message }, "Socket handshake failed: Invalid or expired token");
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });
}
