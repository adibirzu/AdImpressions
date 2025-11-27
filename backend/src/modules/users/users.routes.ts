import { Router } from 'express';
import usersController from './users.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Public routes
router.post('/register', asyncHandler(usersController.register.bind(usersController)));
router.post('/login', asyncHandler(usersController.login.bind(usersController)));

// Protected routes
router.get('/me', authenticate, asyncHandler(usersController.getCurrentUser.bind(usersController)));
router.put('/me', authenticate, asyncHandler(usersController.updateCurrentUser.bind(usersController)));

// Admin routes
router.get('/', authenticate, requireAdmin, asyncHandler(usersController.getAllUsers.bind(usersController)));
router.get('/:id', asyncHandler(usersController.getUserById.bind(usersController)));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(usersController.deleteUser.bind(usersController)));

export default router;
