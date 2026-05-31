"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { useMessages } from "@/hooks/useConversations";
import { MessageSquare } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
  token: string;
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  token,
  currentUserId,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useMessages(conversationId, token);
  const { sendMessage, emitTyping, emitStopTyping, isConnected, typingUsers } =
    useChat({ conversationId, token, userId: currentUserId });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="px-4 py-2 bg-red-500/10 text-red-400 text-xs text-center border-b border-red-500/20">
          Connection lost: Attempting to reconnect...
        </div>
      )}

      {/* Message list */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">
              No messages yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Start a conversation with this vendor to discuss your order.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isSender={message.senderId === currentUserId}
              />
            ))}
            {typingUsers.length > 0 && (
              <div className="self-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Chat input */}
      <ChatInput
        onSend={sendMessage}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        disabled={!isConnected}
      />
    </div>
  );
}

