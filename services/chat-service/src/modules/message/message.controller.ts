import { asyncHandler } from '@repo/common';
import { Request, Response } from 'express';
import { messageService } from './message.service';
import { 
    createMessageBodySchema, 
    listMessagesQuerySchema,
    conversationIdParamsSchema 
} from '@repo/api-contracts';
import { getAuthenticatedUser } from '@/utils/auth';

const getValidatedId = (params: unknown): string => {
    const { id } = conversationIdParamsSchema.parse(params);
    return id;
};

export const createMessageHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const conversationId = getValidatedId(req.params);
    const payload = createMessageBodySchema.parse(req.body);

    const message = await messageService.createMessage(
        conversationId,
        user._id,
        payload.body
    );

    res.status(201).json({ data: message });
});

export const listMessageHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const conversationId = getValidatedId(req.params);
    const query = listMessagesQuerySchema.parse(req.query);

    const after = query.after ? new Date(query.after) : undefined;

    const messages = await messageService.listMessages(conversationId, user._id, {
        limit: query.limit,
        after,
    });

    res.status(200).json({ data: messages });
});
