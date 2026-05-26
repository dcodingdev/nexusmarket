"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@repo/types";
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const activeConversations = conversations.filter(
    (conv) => conv.lastMessageAt || conv.lastMessagePreview
  );

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activeConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No conversations yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border overflow-y-auto">
      {activeConversations.map((conv) => {
        const lastActivity = conv.lastMessageAt
          ? new Date(conv.lastMessageAt)
          : new Date(conv.updatedAt);

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors w-full",
              selectedId === conv.id && "bg-violet-600/10 border-l-2 border-l-violet-600"
            )}
          >
            {/* Avatar placeholder */}
            <div className="h-9 w-9 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-violet-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {conv.title ?? "Conversation"}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(lastActivity, { addSuffix: true })}
                </span>
              </div>
              {conv.lastMessagePreview && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessagePreview}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
