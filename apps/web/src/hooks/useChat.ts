"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { ChatMessage, TypingPayload } from "@/types";

interface UseChatOptions {
  conversationId: string;
  token: string;
  userId: string;
}

interface UseChatReturn {
  sendMessage: (body: string) => void;
  emitTyping: () => void;
  emitStopTyping: () => void;
  isConnected: boolean;
  typingUsers: string[];
}

export function useChat({
  conversationId,
  token,
  userId,
}: UseChatOptions): UseChatReturn {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = getSocket(token);

    // Connect and join room
    socket.connect();
    
    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_room", { conversationId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      toast.error(`Connection lost: Attempting to reconnect...`);
      console.error("Socket connection error:", err.message);
    });

    // New message: sync TanStack Query cache
    socket.on("new_message", (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["messages", conversationId],
        (old = []) => {
          // Deduplicate by _id
          const exists = old.some((m) => m._id === message._id);
          if (exists) return old;
          return [...old, message];
        }
      );

      // Invalidate conversation list to update lastMessagePreview
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    // Typing indicators
    socket.on("user_typing", ({ userId: typingUserId }: TypingPayload) => {
      if (typingUserId === userId) return;
      setTypingUsers((prev) =>
        prev.includes(typingUserId) ? prev : [...prev, typingUserId]
      );
    });

    socket.on("user_stopped_typing", ({ userId: stoppedUserId }: TypingPayload) => {
      setTypingUsers((prev) => prev.filter((id) => id !== stoppedUserId));
    });

    return () => {
      socket.emit("leave_room", { conversationId });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      disconnectSocket();
    };
  }, [conversationId, token, userId, queryClient]);

  const sendMessage = useCallback(
    (body: string) => {
      const socket = getSocket(token);
      socket.emit("send_message", { conversationId, body });
    },
    [conversationId, token]
  );

  const emitTyping = useCallback(() => {
    const socket = getSocket(token);
    socket.emit("typing", { conversationId });

    // Auto stop_typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 3000);
  }, [conversationId, token]);

  const emitStopTyping = useCallback(() => {
    const socket = getSocket(token);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stop_typing", { conversationId });
  }, [conversationId, token]);

  return { sendMessage, emitTyping, emitStopTyping, isConnected, typingUsers };
}

