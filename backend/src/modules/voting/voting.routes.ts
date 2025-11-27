import { Router } from 'express';
import votingController from './voting.controller';
import { authenticate, optionalAuthenticate, requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { strictRateLimit } from '../../middleware/rateLimit';

const router = Router();

// Public routes with rate limiting
router.post('/', optionalAuthenticate, strictRateLimit(), asyncHandler(votingController.createVote.bind(votingController)));
router.get('/ad/:adId', asyncHandler(votingController.getVotesForAd.bind(votingController)));
router.get('/ad/:adId/stats', asyncHandler(votingController.getVoteStats.bind(votingController)));
router.get('/recent', asyncHandler(votingController.getRecentVotes.bind(votingController)));
router.get('/check/:adId', optionalAuthenticate, asyncHandler(votingController.checkUserVote.bind(votingController)));
router.get('/:id', asyncHandler(votingController.getVoteById.bind(votingController)));

// Protected routes
router.get('/user/me', authenticate, asyncHandler(votingController.getMyVotes.bind(votingController)));

// Admin routes
router.delete('/:id', authenticate, requireAdmin, asyncHandler(votingController.deleteVote.bind(votingController)));

export default router;
