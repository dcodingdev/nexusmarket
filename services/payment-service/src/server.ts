
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { Server } from "http";
import { env } from "./config/env.js";

import logger from "@repo/logger";
import { connectDatabase, mongoose } from "@repo/database";
import { connectRMQ, stopConsumers } from "@repo/rabbitmq";

// Routes
import paymentRoutes from "./modules/payments/payment.routes.js";
import payoutRoutes from "./modules/payouts/payout.routes.js";

const app: Application = express();
const PORT = env.PORT || 4004;
const PAYMENT_MONGO_URI = env.MONGO_URI;

let server: Server;

/**
 * 🛠️ Middleware Configuration
 * Crucial: Stripe needs the raw body to verify signatures. 
 * We use the 'verify' hook to capture it before the JSON parser consumes it.
 */
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      if (req.originalUrl.includes("/webhook/stripe")) {
        req.rawBody = buf; 
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/**
 * 🏥 Health Check
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", service: "payment-service" });
});

/**
 * 🚦 Routes
 */
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);

/**
 * 📝 Global Error Handler
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled Error in Payment Service");
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/**
 * 🛡️ Graceful Shutdown
 */
const shutdown = async (signal: string) => {
  logger.info({ signal }, `🚀 Payment Service: Starting graceful shutdown`);

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
    logger.error({ err: error }, "❌ Error during Payment Service shutdown");
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
      throw new Error("Missing MONGO_URI or RABBITMQ_URL in environment");
    }

    await connectDatabase(PAYMENT_MONGO_URI!);
    await connectRMQ(env.RABBITMQ_URL);

    server = app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`💸 Payment Service running on port ${PORT}`);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled Promise Rejection");
    });
    
  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start Payment Service");
    process.exit(1);
  }
};

start();