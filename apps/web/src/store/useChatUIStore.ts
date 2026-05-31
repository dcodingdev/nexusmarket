import { create } from 'zustand';

interface ChatUIState {
  isOpen: boolean;
  activeConversationId: string | null;
  setOpen: (isOpen: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
  openChat: (conversationId: string) => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  setOpen: (isOpen) => set({ isOpen }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  openChat: (conversationId) => set({ isOpen: true, activeConversationId: conversationId }),
}));

