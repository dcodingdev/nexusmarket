"use client";

import { useChatUIStore } from "@/store/useChatUIStore";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./ChatWindow";
import { ConversationList } from "./ConversationList";
import { useConversations } from "@/hooks/useConversations";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";

interface ChatBubbleProps {
  token?: string;
  currentUserId?: string;
}

export function ChatBubble({
  token,
  currentUserId,
}: ChatBubbleProps) {
  console.log("ChatBubble render call. Token present:", !!token, "currentUserId:", currentUserId);
  const { isOpen, activeConversationId, setOpen, setActiveConversationId } = useChatUIStore();
  const { data: conversations = [], isLoading } = useConversations(token || "");

  // Don't render for guests / unauthenticated users
  if (!token || !currentUserId) return null;

  const handleCreateSupportChat = async () => {
    const toastId = toast.loading("Opening support chat...");
    try {
      const res = await apiClient<any>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          title: "Platform Support",
          participantIds: ["support"], // maps to Admin on the backend
        }),
      });

      toast.success("Support chat opened!", { id: toastId });
      setActiveConversationId(res.data.id);
    } catch (err: any) {
      toast.error(err.message || "Could not open support chat.", { id: toastId });
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300",
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-white/20",
          isOpen ? "rotate-90" : ""
        )}
        size="icon"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-80 h-[500px] rounded-3xl overflow-hidden",
          "border border-border/80 shadow-2xl bg-card/95 backdrop-blur-md flex flex-col",
          "transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            {activeConversationId && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 p-0 mr-1 text-muted-foreground hover:text-foreground rounded-lg"
                onClick={() => setActiveConversationId(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-foreground">
              {activeConversationId 
                ? (conversations.find(c => c.id === activeConversationId)?.title || "Chat Window")
                : "Marketplace Messages"
              }
            </span>
          </div>
          {!activeConversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSupportChat}
              className="text-xs border-indigo-500/20 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 h-7 rounded-lg font-semibold flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Support
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              token={token}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="h-full flex flex-col overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={undefined}
                onSelect={(id) => setActiveConversationId(id)}
                isLoading={isLoading}
              />
              {!isLoading && conversations.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    To start a chat, visit any product details page and click <strong>"Chat with Seller"</strong>, or initiate support directly below:
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCreateSupportChat}
                    className="mt-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                  >
                    Start Support Chat
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

