// services/auth-service/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import * as AuthController from './auth.controller.js';
import { RegisterSchema, LoginSchema } from '@repo/api-contracts';

const router: Router = Router();

router.post('/register',  AuthController.register);
router.post('/login',  AuthController.login);
router.get('/refresh', AuthController.refresh);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;