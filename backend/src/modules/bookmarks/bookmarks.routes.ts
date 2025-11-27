import { Router } from 'express';
import bookmarksController from './bookmarks.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Ad bookmark routes
router.post('/ads/:adId/bookmark', authenticate, asyncHandler(bookmarksController.addBookmark.bind(bookmarksController)));
router.delete('/ads/:adId/bookmark', authenticate, asyncHandler(bookmarksController.removeBookmark.bind(bookmarksController)));
router.get('/ads/:adId/bookmark/status', optionalAuthenticate, asyncHandler(bookmarksController.checkBookmarkStatus.bind(bookmarksController)));

// User bookmarks routes
router.get('/users/me/bookmarks', authenticate, asyncHandler(bookmarksController.getMyBookmarks.bind(bookmarksController)));
router.get('/users/:userId/bookmarks', asyncHandler(bookmarksController.getUserBookmarks.bind(bookmarksController)));

export default router;
