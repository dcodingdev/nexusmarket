import { Router } from 'express';
import { attachAuthenticatedUser, validateRequest } from '@repo/common';
import * as controller from './conversation.controller';
import {
    createConversationSchema,
    listConversationsQuerySchema,
    conversationIdParamsSchema,
} from '@repo/api-contracts';

const router = Router();

router.use(attachAuthenticatedUser);

router.post(
    '/',
    validateRequest({ body: createConversationSchema }),
    controller.createConversationHandler,
);

router.get(
    '/',
    validateRequest({ query: listConversationsQuerySchema }),
    controller.listConversationHandler,
);

router.get(
    '/:id',
    validateRequest({ params: conversationIdParamsSchema }),
    controller.getConversationHandler,
);

export default router;
export { router as conversationRouter };
