"use client";

import { useState } from "react";
import { ConversationList } from "@/modules/chat/components/ConversationList";
import { ChatWindow } from "@/modules/chat/components/ChatWindow";
import { useConversations } from "@/hooks/useConversations";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerMessagesPage() {
  const { accessToken, user } = useAuth();
  const token = accessToken || "";
  const currentUserId = user?._id || "";

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: conversations = [], isLoading } = useConversations(token);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden border border-border/80 rounded-2xl shadow-xl bg-card">
      {/* Left panel: Conversation List */}
      <div className="w-80 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="px-5 py-4 border-b border-border bg-card/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            <h1 className="text-base font-bold text-foreground">Messages</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId ?? undefined}
            onSelect={setSelectedConversationId}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Right panel: Message Window */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            token={token}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <h2 className="text-base font-bold text-foreground">
              Select a conversation
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a conversation from the sidebar list to view your messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
