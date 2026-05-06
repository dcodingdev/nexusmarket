import { z } from 'zod';

export const createConversationSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    participantIds: z.array(z.string().min(1)).min(1),
});

export const listConversationsQuerySchema = z.object({
    participantId: z.string().min(1).optional(),
});

export const conversationIdParamsSchema = z.object({
    id: z.string().min(1),
});
