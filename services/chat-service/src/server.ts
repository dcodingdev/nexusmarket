import "dotenv/config.js";
import express, { Application } from "express";
import cors from "cors";
import { createServer, Server } from "http";
import logger from "@repo/logger";
import { connectDatabase } from "@repo/database";
import { connectRedis } from "@/clients/redis.client";
import { getMongoClient } from "@/clients/mongo.client";
import { createSocketServer } from "@/socket/socket.server";
import conversationRoutes from "./modules/conversation/conversation.routes";
import messageRoutes from "./modules/message/message.routes";

const app: Application = express();
const PORT = process.env.CHAT_PORT || 4006;

let server: Server;

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "chat-service" });
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Chat Service is running" });
});

app.use("/api/chat", router);

const start = async () => {
  try {
    // Connect to clients
    const mongoUri = process.env.CHAT_MONGO_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error("CHAT_MONGO_URI or MONGO_URI is not defined");
    await connectDatabase(mongoUri);
    await getMongoClient();
    await connectRedis().catch(err => {
      logger.error({ err }, "⚠️ Redis connection failed, some chat features may be limited");
    });


    // Mount Modules
    app.use("/api/chat/conversations", conversationRoutes);
    app.use("/api/chat/conversations", messageRoutes); // Message routes are sub-resources of conversations

    // Create HTTP server and attach Socket.io
    server = createServer(app);
    createSocketServer(server);

    server.listen(PORT, () => {
      logger.info(`💬 Chat Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "💥 Failed to start Chat Service");
    process.exit(1);
  }
};

start();
