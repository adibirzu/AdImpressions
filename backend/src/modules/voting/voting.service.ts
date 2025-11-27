import { db } from '../../config/database';
import { Vote, CreateVoteDTO, VoteStats } from './voting.types';
import { generateId, isValidRating } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';
import adsService from '../ads/ads.service';

export class VotingService {
  /**
   * Create a new vote
   */
  createVote(
    data: CreateVoteDTO,
    userId?: string,
    userIp?: string,
    userAgent?: string
  ): Vote {
    // Validate rating
    if (!isValidRating(data.rating)) {
      throw new AppError('Invalid rating. Rating must be between 1 and 5', 400);
    }

    // Check if ad exists
    const ad = adsService.getAdById(data.ad_id);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }

    if (ad.status !== 'active') {
      throw new AppError('Cannot vote on inactive ads', 400);
    }

    // Check if user has already voted (if user is authenticated)
    if (userId) {
      const existingVote = this.getUserVoteForAd(userId, data.ad_id);
      if (existingVote) {
        throw new AppError('You have already voted on this ad', 400);
      }
    }

    // Create the vote
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO votes (id, ad_id, user_id, rating, user_ip, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.ad_id, userId || null, data.rating, userIp || null, userAgent || null, now);

    // Update ad rating statistics
    adsService.updateAdRating(data.ad_id, data.rating);

    const vote = this.getVoteById(id);
    if (!vote) {
      throw new AppError('Failed to create vote', 500);
    }

    return vote;
  }

  /**
   * Get a vote by ID
   */
  getVoteById(id: string): Vote | null {
    const stmt = db.prepare('SELECT * FROM votes WHERE id = ?');
    const vote = stmt.get(id) as Vote | undefined;
    return vote || null;
  }

  /**
   * Get user's vote for a specific ad
   */
  getUserVoteForAd(userId: string, adId: string): Vote | null {
    const stmt = db.prepare('SELECT * FROM votes WHERE user_id = ? AND ad_id = ?');
    const vote = stmt.get(userId, adId) as Vote | undefined;
    return vote || null;
  }

  /**
   * Get all votes for an ad
   */
  getVotesForAd(adId: string): Vote[] {
    const stmt = db.prepare('SELECT * FROM votes WHERE ad_id = ? ORDER BY created_at DESC');
    return stmt.all(adId) as Vote[];
  }

  /**
   * Get all votes by a user
   */
  getUserVotes(userId: string): Vote[] {
    const stmt = db.prepare('SELECT * FROM votes WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as Vote[];
  }

  /**
   * Get vote statistics for an ad
   */
  getVoteStats(adId: string): VoteStats {
    const votes = this.getVotesForAd(adId);

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    let totalRating = 0;

    votes.forEach(vote => {
      ratingDistribution[vote.rating as keyof typeof ratingDistribution]++;
      totalRating += vote.rating;
    });

    const averageRating = votes.length > 0 ? Math.round((totalRating / votes.length) * 100) / 100 : 0;

    return {
      ad_id: adId,
      total_votes: votes.length,
      average_rating: averageRating,
      rating_distribution: ratingDistribution
    };
  }

  /**
   * Delete a vote (admin only)
   */
  deleteVote(id: string): void {
    const vote = this.getVoteById(id);
    if (!vote) {
      throw new AppError('Vote not found', 404);
    }

    const stmt = db.prepare('DELETE FROM votes WHERE id = ?');
    stmt.run(id);

    // Recalculate ad rating
    const ad = adsService.getAdById(vote.ad_id);
    if (ad) {
      const updateStmt = db.prepare(`
        UPDATE ads
        SET total_votes = (SELECT COUNT(*) FROM votes WHERE ad_id = ?),
            average_rating = (
              SELECT COALESCE(ROUND(AVG(rating) * 100) / 100, 0)
              FROM votes
              WHERE ad_id = ?
            ),
            updated_at = ?
        WHERE id = ?
      `);

      updateStmt.run(vote.ad_id, vote.ad_id, new Date().toISOString(), vote.ad_id);
    }
  }

  /**
   * Get recent votes (for activity feed)
   */
  getRecentVotes(limit: number = 20): Vote[] {
    const stmt = db.prepare('SELECT * FROM votes ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit) as Vote[];
  }

  /**
   * Check if IP has voted on an ad (for anonymous users)
   */
  hasIpVotedForAd(ip: string, adId: string): boolean {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM votes
      WHERE user_ip = ? AND ad_id = ? AND user_id IS NULL
    `);

    const result = stmt.get(ip, adId) as { count: number };
    return result.count > 0;
  }
}

export default new VotingService();
