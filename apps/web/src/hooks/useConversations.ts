import { useQuery } from "@tanstack/react-query";
import type { Conversation, ChatMessage } from "@/types";
import { apiClient } from "@/core/api/client";

async function fetchConversations(): Promise<Conversation[]> {
  const json = await apiClient<any>("/chat/conversations");
  return json.data ?? [];
}

async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const json = await apiClient<any>(`/chat/conversations/${conversationId}/messages`);
  return json.data ?? [];
}

export function useConversations(token: string) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useMessages(conversationId: string, token: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId && !!token,
    staleTime: 60_000,
  });
}

