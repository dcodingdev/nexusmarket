
import express, { Application } from "express";
import cors from "cors";
import { Server } from "http";
import { env } from "./config/env.js";

import logger from "@repo/logger";
import { connectDatabase, mongoose } from "@repo/database";
import { connectRMQ, stopConsumers } from "@repo/rabbitmq";

// Consumers & Routes
import { initOrderConsumers } from "./config/order.consumer.js";
import orderRoutes from "./modules/order.routes.js";

const app: Application = express();
const PORT = env.PORT || 4003;
const ORDER_MONGO_URI = env.MONGO_URI;

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

/**
 * Routes
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "order-service", time: new Date().toISOString() });
});
app.use("/api/orders", orderRoutes);

/**
 * 🛡️ Graceful Shutdown
 */
const shutdown = async (signal: string) => {
  logger.info({ signal }, `🚀 Order Service: Starting graceful shutdown`);

  try {
    if (server) server.close();
    await stopConsumers();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "❌ Error during Order Service shutdown");
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
    if (!env.MONGO_URI || !env.RABBITMQ_URL) {
      throw new Error("Missing MONGO_URI or RABBITMQ_URL");
    }

    await connectDatabase(ORDER_MONGO_URI!);
    await connectRMQ(env.RABBITMQ_URL);
    
    // Initialize RabbitMQ Listeners for Payment Success/Fail
    await initOrderConsumers();

    server = app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`🛒 Order Service running on port ${PORT}`);
    });

  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start Order Service");
    process.exit(1);
  }
};

start();