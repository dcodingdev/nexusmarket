import { z } from 'zod';

// ============ USER ============
export enum UserRole {
    ADMIN = "admin",
    VENDOR = "vendor",
    CUSTOMER = "customer",
}

export interface User {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}

export interface AuthUser {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// ============ CHAT ============
export interface ChatMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date | string;
}

export interface Conversation {
    id: string;
    title?: string | null;
    participantIds: string[];
    lastMessageAt?: Date | string | null;
    lastMessagePreview?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface SocketServerToClientEvents {
    new_message: (message: ChatMessage) => void;
    user_typing: (payload: TypingPayload) => void;
    user_stopped_typing: (payload: TypingPayload) => void;
    message_read: (payload: ReadReceiptPayload) => void;
    error: (message: string) => void;
}

export interface SocketClientToServerEvents {
    join_room: (payload: { conversationId: string }) => void;
    leave_room: (payload: { conversationId: string }) => void;
    send_message: (payload: { conversationId: string; body: string }) => void;
    typing: (payload: { conversationId: string }) => void;
    stop_typing: (payload: { conversationId: string }) => void;
    mark_read: (payload: ReadReceiptPayload) => void;
}

export interface TypingPayload {
    conversationId: string;
    userId: string;
}

export interface ReadReceiptPayload {
    conversationId: string;
    messageId: string;
    userId: string;
}

// ============ API CONTRACTS ============
export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2),
    role: z.enum(['vendor', 'customer']).optional(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

