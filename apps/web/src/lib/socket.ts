"use client";

import { io, Socket } from "socket.io-client";
import type {
  SocketServerToClientEvents,
  SocketClientToServerEvents,
} from "@repo/types";

export type TypedClientSocket = Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
>;

let socket: TypedClientSocket | null = null;

export function getSocket(token?: string): TypedClientSocket {
  if (!socket) {
    const serviceUrl = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:8000/api/v1/chat";
    let origin = "http://localhost:8000";
    let socketPath = "/api/v1/chat/socket.io";

    try {
      const parsedUrl = new URL(serviceUrl);
      origin = parsedUrl.origin;
      if (parsedUrl.pathname && parsedUrl.pathname !== "/") {
        const cleanPath = parsedUrl.pathname.replace(/\/$/, "");
        socketPath = `${cleanPath}/socket.io`;
      } else {
        socketPath = "/api/chat/socket.io";
      }
    } catch (e) {
      console.error("Failed to parse NEXT_PUBLIC_CHAT_SERVICE_URL, using defaults", e);
    }

    console.log("Initializing Socket.io client with origin:", origin, "and path:", socketPath);

    socket = io(origin, {
      auth: { token: token || "" },
      transports: ["polling", "websocket"],
      autoConnect: false, // Controlled connection lifecycle
      path: socketPath,
    });
  } else if (token) {
    // Sync the token dynamically in case it changed or was loaded late
    socket.auth = { token };
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
