import { Router } from 'express';
import { authenticate, authorize } from '@repo/common'; // ✅ Clean workspace import
import { UserRole } from '@repo/types';
import { getProfile, updateProfile, getAllUsers, toggleUserSuspension, upgradeToVendor } from './user.controller.js';

const router: Router = Router();

/**
 * All routes here are protected. 
 * The 'authenticate' middleware ensures only logged-in users 
 * with a valid Bearer Token can access them.
 */

// GET /api/users/profile
router.get('/profile', authenticate, getProfile);

// PATCH /api/users/profile
router.patch('/profile', authenticate, updateProfile);

// POST /api/users/upgrade-to-vendor
router.post('/upgrade-to-vendor', authenticate, upgradeToVendor);

/**
 * Admin Oversight Routes
 */
router.get('/', authenticate, authorize([UserRole.ADMIN]), getAllUsers);
router.patch('/:id/suspend', authenticate, authorize([UserRole.ADMIN]), toggleUserSuspension);

export default router;