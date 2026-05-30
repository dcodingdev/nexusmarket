import { env } from '../config/env.js';
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import logger from "@repo/logger";
import { applySocketAuth } from "./socket.auth";
import { registerSocketHandlers } from "./socket.handlers";
import type { TypedServer } from "./socket.types";

let io: TypedServer | null = null;

export function createSocketServer(httpServer: HttpServer): TypedServer {
  const socketIo = new Server(httpServer, {
    path: "/api/chat/socket.io",
    cors: {
      origin: env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  }) as TypedServer;

  // Apply Redis adapter for horizontal scaling
  const redisUrl = env.REDIS_URL;
  if (redisUrl) {
    try {
      const pubClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        family: 4,
      });
      const subClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        family: 4,
      });



      pubClient.on("error", (err) => {
        logger.warn({ err }, "Socket.io Redis pub client error");
      });
      subClient.on("error", (err) => {
        logger.warn({ err }, "Socket.io Redis sub client error");
      });

      socketIo.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.io Redis adapter connected");
    } catch (err) {
      logger.warn({ err }, "Socket.io Redis adapter failed — running without adapter");
    }
  } else {
    logger.warn("REDIS_URL not set — Socket.io running without Redis adapter (single instance only)");
  }

  // Apply handshake JWT auth
  applySocketAuth(socketIo);

  // Register event handlers for each connection
  socketIo.on("connection", (socket) => {
    registerSocketHandlers(socketIo, socket);
  });

  io = socketIo;
  logger.info("Socket.io server initialized");
  return socketIo;
}

export function getSocketServer(): TypedServer {
  if (!io) {
    throw new Error("Socket server not initialized. Call createSocketServer() first.");
  }
  return io;
}
