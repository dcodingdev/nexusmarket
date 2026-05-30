
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { Server } from "http";
import { env } from "./config/env.js";

import logger from "@repo/logger";
import {connectDatabase, mongoose } from "@repo/database";
import { connectRMQ, stopConsumers } from "@repo/rabbitmq";

import { initProductConsumers} from "./config/rabbit-consumer.js";

// Routes
import stockroutes from "./modules/stock/stock.routes.js";
import productRoutes from "./modules/products/product.routes.js";

const app: Application = express();
const PORT = env.PRODUCT_PORT || 4002;
const PRODUCT_MONGO_URI = env.MONGO_URI;

let server: Server;

/**
 * Middleware
 */
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON format" });
  }
  next();
});

/**
 * Routes
 */

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "product-service"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/stock", stockroutes); // New Stock endpoints

/**
 * 🛡️ Graceful Shutdown
 */
const shutdown = async (signal: string) => {
  logger.info({ signal }, "🚀 Product Service: Starting graceful shutdown");

  try {
    if (server) {
      server.close();
      logger.info("HTTP server closed.");
    }

    await stopConsumers();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed.");
    }

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "❌ Error during Product Service shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/**
 * 🚀 Start Service
 */
const start = async () => {
  try {
    // Validate env
    if (!env.MONGO_URI || !env.RABBITMQ_URL) {
      throw new Error("Missing MONGO_URI or RABBITMQ_URL in environment");
    }

    /**
     * DB Connection
     */
    await connectDatabase(PRODUCT_MONGO_URI!);

    /**
     * RabbitMQ Connection
     */


    /**
     * Start HTTP Server
     */
    server = app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`📦 Product & Stock Service running on port ${PORT}`);
    });

    /**
     * Global Error Handling
     */
    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled Rejection");
    });

  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start Product Service");
    process.exit(1);
  }
};

start();