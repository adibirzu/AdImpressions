import { Router } from 'express';
import analyticsController from './analytics.controller';
import { optionalAuthenticate, authenticate, requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Public routes
router.post('/track', optionalAuthenticate, asyncHandler(analyticsController.trackEvent.bind(analyticsController)));
router.get('/ad/:adId', asyncHandler(analyticsController.getAdSummary.bind(analyticsController)));
router.get('/ad/:adId/events', asyncHandler(analyticsController.getAdEvents.bind(analyticsController)));
router.get('/platform-stats', asyncHandler(analyticsController.getPlatformStats.bind(analyticsController)));

// Protected routes (admin only)
router.get('/date-range', authenticate, requireAdmin, asyncHandler(analyticsController.getDateRangeAnalytics.bind(analyticsController)));
router.get('/weekly-archives', authenticate, requireAdmin, asyncHandler(analyticsController.getAllWeeklyArchives.bind(analyticsController)));
router.get('/weekly-archives/:adId', asyncHandler(analyticsController.getAdWeeklyArchives.bind(analyticsController)));
router.post('/archive-week', authenticate, requireAdmin, asyncHandler(analyticsController.archiveWeek.bind(analyticsController)));

export default router;
