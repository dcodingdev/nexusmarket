 
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'http';

import logger from '@repo/logger';
import { connectDatabase, mongoose } from '@repo/database';
import { connectRMQ, stopConsumers } from '@repo/rabbitmq'; 

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';

import { env } from './config/env.js';

const app: Application = express();
const PORT = env.AUTH_PORT || 4001;
const AUTH_MONGO_URI = env.MONGO_URI;
let server: Server;

// 1. Standard Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "auth-service"
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 3. Graceful Shutdown Handler
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    if (server) {
      server.close(() => logger.info('HTTP server closed.'));
    }

    // Close RabbitMQ connections
    await stopConsumers();

    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
    }

    logger.info('Graceful shutdown complete. Exiting.');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught Exception thrown');
  process.exit(1);
});

// 4. Start Function
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase(AUTH_MONGO_URI);
    
    if (!env.RABBITMQ_URL) {
        logger.warn('RABBITMQ_URL not found in environment');
    }
    
    server = app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`Auth Service active on port ${PORT}`);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ promise, reason }, 'Unhandled Rejection at Promise');
    });

  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start Auth Service');
    process.exit(1);
  }
};

start();