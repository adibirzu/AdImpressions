import { Router } from 'express';
import adsController from './ads.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Public routes
router.get('/', asyncHandler(adsController.getAllAds.bind(adsController)));
router.get('/top-rated', asyncHandler(adsController.getTopRatedAds.bind(adsController)));
router.get('/trending', asyncHandler(adsController.getTrendingAds.bind(adsController)));
router.get('/categories', asyncHandler(adsController.getCategories.bind(adsController)));
router.get('/category/:category', asyncHandler(adsController.getAdsByCategory.bind(adsController)));
router.get('/:id', asyncHandler(adsController.getAdById.bind(adsController)));

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, asyncHandler(adsController.createAd.bind(adsController)));
router.put('/:id', authenticate, requireAdmin, asyncHandler(adsController.updateAd.bind(adsController)));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(adsController.deleteAd.bind(adsController)));

export default router;
