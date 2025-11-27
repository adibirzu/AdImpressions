import { Request, Response } from 'express';
import votingService from './voting.service';
import { CreateVoteDTO } from './voting.types';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class VotingController {
  /**
   * POST /api/votes
   * Create a new vote
   */
  async createVote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateVoteDTO = req.body;

      if (!data.ad_id || !data.rating) {
        throw new AppError('Ad ID and rating are required', 400);
      }

      const userId = req.user?.id;
      const userIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // For anonymous users, check if IP has already voted
      if (!userId && userIp) {
        const hasVoted = votingService.hasIpVotedForAd(userIp, data.ad_id);
        if (hasVoted) {
          throw new AppError('You have already voted on this ad', 400);
        }
      }

      const vote = votingService.createVote(data, userId, userIp, userAgent);

      res.status(201).json({
        success: true,
        message: 'Vote recorded successfully',
        data: vote
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/:id
   * Get a vote by ID
   */
  async getVoteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const vote = votingService.getVoteById(id);

      if (!vote) {
        throw new AppError('Vote not found', 404);
      }

      res.json({
        success: true,
        data: vote
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/ad/:adId
   * Get all votes for an ad
   */
  async getVotesForAd(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const votes = votingService.getVotesForAd(adId);

      res.json({
        success: true,
        count: votes.length,
        data: votes
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/ad/:adId/stats
   * Get vote statistics for an ad
   */
  async getVoteStats(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const stats = votingService.getVoteStats(adId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/user/me
   * Get current user's votes
   */
  async getMyVotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const votes = votingService.getUserVotes(req.user.id);

      res.json({
        success: true,
        count: votes.length,
        data: votes
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/recent
   * Get recent votes
   */
  async getRecentVotes(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const votes = votingService.getRecentVotes(limit);

      res.json({
        success: true,
        count: votes.length,
        data: votes
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/votes/:id
   * Delete a vote (admin only)
   */
  async deleteVote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      votingService.deleteVote(id);

      res.json({
        success: true,
        message: 'Vote deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/votes/check/:adId
   * Check if user has voted on an ad
   */
  async checkUserVote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      let hasVoted = false;
      let vote = null;

      if (req.user) {
        vote = votingService.getUserVoteForAd(req.user.id, adId);
        hasVoted = vote !== null;
      } else {
        const userIp = req.ip || req.socket.remoteAddress;
        if (userIp) {
          hasVoted = votingService.hasIpVotedForAd(userIp, adId);
        }
      }

      res.json({
        success: true,
        data: {
          hasVoted,
          vote
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new VotingController();
