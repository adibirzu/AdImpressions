import { Router } from 'express';
import commentsController from './comments.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { strictRateLimit } from '../../middleware/rateLimit';

const router = Router();

// Routes for comments on a specific ad
// POST /api/ads/:adId/comments - Create comment
router.post(
  '/ads/:adId/comments',
  optionalAuthenticate,
  strictRateLimit(),
  asyncHandler(commentsController.createComment.bind(commentsController))
);

// GET /api/ads/:adId/comments - Get comments with pagination
router.get(
  '/ads/:adId/comments',
  asyncHandler(commentsController.getCommentsByAdId.bind(commentsController))
);

// GET /api/ads/:adId/comments/count - Get comment count
router.get(
  '/ads/:adId/comments/count',
  asyncHandler(commentsController.getCommentCount.bind(commentsController))
);

// Routes for individual comments
// GET /api/comments/:id - Get single comment
router.get(
  '/comments/:id',
  asyncHandler(commentsController.getCommentById.bind(commentsController))
);

// PUT /api/comments/:id - Update comment (requires auth)
router.put(
  '/comments/:id',
  authenticate,
  asyncHandler(commentsController.updateComment.bind(commentsController))
);

// DELETE /api/comments/:id - Delete comment (requires auth)
router.delete(
  '/comments/:id',
  authenticate,
  asyncHandler(commentsController.deleteComment.bind(commentsController))
);

// Utility routes
// GET /api/comments/recent - Get recent comments
router.get(
  '/comments/recent',
  asyncHandler(commentsController.getRecentComments.bind(commentsController))
);

// GET /api/comments/user/me - Get current user's comments
router.get(
  '/comments/user/me',
  authenticate,
  asyncHandler(commentsController.getMyComments.bind(commentsController))
);

export default router;
