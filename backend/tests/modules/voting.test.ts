import Database from 'better-sqlite3';
import { VotingService } from '../../src/modules/voting/voting.service';
import { setupTestDatabase, clearTestData, createTestAd, createTestUser, createTestVote } from '../setup';
import { AppError } from '../../src/middleware/errorHandler';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {} as Database.Database
}));

describe('VotingService', () => {
  let testDb: Database.Database;
  let votingService: VotingService;

  beforeAll(() => {
    testDb = setupTestDatabase();
    // Replace the db import with our test database
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;
    votingService = new VotingService();
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  describe('createVote', () => {
    it('should create a vote for an active ad', () => {
      const ad = createTestAd(testDb, { status: 'active' });
      const user = createTestUser(testDb);

      const vote = votingService.createVote(
        { ad_id: ad.id, rating: 5 },
        user.id,
        '127.0.0.1',
        'Mozilla/5.0'
      );

      expect(vote).toBeDefined();
      expect(vote.ad_id).toBe(ad.id);
      expect(vote.user_id).toBe(user.id);
      expect(vote.rating).toBe(5);
      expect(vote.user_ip).toBe('127.0.0.1');
      expect(vote.user_agent).toBe('Mozilla/5.0');
    });

    it('should create a vote without user_id for anonymous users', () => {
      const ad = createTestAd(testDb, { status: 'active' });

      const vote = votingService.createVote(
        { ad_id: ad.id, rating: 4 },
        undefined,
        '192.168.1.1',
        'Chrome'
      );

      expect(vote).toBeDefined();
      expect(vote.ad_id).toBe(ad.id);
      expect(vote.user_id).toBeNull();
      expect(vote.rating).toBe(4);
      expect(vote.user_ip).toBe('192.168.1.1');
    });

    it('should throw error for invalid rating (too low)', () => {
      const ad = createTestAd(testDb);

      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 0 })
      ).toThrow(AppError);
      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 0 })
      ).toThrow('Invalid rating');
    });

    it('should throw error for invalid rating (too high)', () => {
      const ad = createTestAd(testDb);

      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 6 })
      ).toThrow(AppError);
      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 6 })
      ).toThrow('Invalid rating');
    });

    it('should throw error for invalid rating (non-integer)', () => {
      const ad = createTestAd(testDb);

      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 3.5 })
      ).toThrow(AppError);
    });

    it('should throw error when ad does not exist', () => {
      expect(() =>
        votingService.createVote({ ad_id: 'non-existent', rating: 5 })
      ).toThrow(AppError);
      expect(() =>
        votingService.createVote({ ad_id: 'non-existent', rating: 5 })
      ).toThrow('Ad not found');
    });

    it('should throw error when voting on inactive ad', () => {
      const ad = createTestAd(testDb, { status: 'inactive' });

      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 5 })
      ).toThrow(AppError);
      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 5 })
      ).toThrow('Cannot vote on inactive ads');
    });

    it('should prevent duplicate votes from same user', () => {
      const ad = createTestAd(testDb);
      const user = createTestUser(testDb);

      votingService.createVote({ ad_id: ad.id, rating: 5 }, user.id);

      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 4 }, user.id)
      ).toThrow(AppError);
      expect(() =>
        votingService.createVote({ ad_id: ad.id, rating: 4 }, user.id)
      ).toThrow('already voted');
    });

    it('should allow votes from different users on same ad', () => {
      const ad = createTestAd(testDb);
      const user1 = createTestUser(testDb);
      const user2 = createTestUser(testDb);

      const vote1 = votingService.createVote({ ad_id: ad.id, rating: 5 }, user1.id);
      const vote2 = votingService.createVote({ ad_id: ad.id, rating: 4 }, user2.id);

      expect(vote1).toBeDefined();
      expect(vote2).toBeDefined();
      expect(vote1.user_id).toBe(user1.id);
      expect(vote2.user_id).toBe(user2.id);
    });

    it('should update ad rating statistics after vote', () => {
      const ad = createTestAd(testDb);

      votingService.createVote({ ad_id: ad.id, rating: 5 });

      const updatedAd = testDb.prepare('SELECT * FROM ads WHERE id = ?').get(ad.id) as any;
      expect(updatedAd.total_votes).toBe(1);
      expect(updatedAd.average_rating).toBe(5);
    });
  });

  describe('getVoteById', () => {
    it('should retrieve an existing vote', () => {
      const ad = createTestAd(testDb);
      const testVote = createTestVote(testDb, { ad_id: ad.id, rating: 5 });

      const vote = votingService.getVoteById(testVote.id);

      expect(vote).toBeDefined();
      expect(vote?.id).toBe(testVote.id);
      expect(vote?.rating).toBe(5);
    });

    it('should return null for non-existent vote', () => {
      const vote = votingService.getVoteById('non-existent-id');

      expect(vote).toBeNull();
    });
  });

  describe('getUserVoteForAd', () => {
    it('should retrieve user\'s vote for specific ad', () => {
      const ad = createTestAd(testDb);
      const user = createTestUser(testDb);
      const testVote = createTestVote(testDb, { ad_id: ad.id, user_id: user.id, rating: 5 });

      const vote = votingService.getUserVoteForAd(user.id, ad.id);

      expect(vote).toBeDefined();
      expect(vote?.id).toBe(testVote.id);
      expect(vote?.user_id).toBe(user.id);
      expect(vote?.ad_id).toBe(ad.id);
    });

    it('should return null when user has not voted on ad', () => {
      const ad = createTestAd(testDb);
      const user = createTestUser(testDb);

      const vote = votingService.getUserVoteForAd(user.id, ad.id);

      expect(vote).toBeNull();
    });
  });

  describe('getVotesForAd', () => {
    it('should retrieve all votes for an ad', () => {
      const ad = createTestAd(testDb);
      const user1 = createTestUser(testDb);
      const user2 = createTestUser(testDb);

      createTestVote(testDb, { ad_id: ad.id, user_id: user1.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, user_id: user2.id, rating: 4 });

      const votes = votingService.getVotesForAd(ad.id);

      expect(votes).toHaveLength(2);
      expect(votes.every(v => v.ad_id === ad.id)).toBe(true);
    });

    it('should return empty array for ad with no votes', () => {
      const ad = createTestAd(testDb);

      const votes = votingService.getVotesForAd(ad.id);

      expect(votes).toHaveLength(0);
    });

    it('should return votes sorted by created_at DESC', () => {
      const ad = createTestAd(testDb);

      const vote1 = createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      // Small delay to ensure different timestamps
      const vote2 = createTestVote(testDb, { ad_id: ad.id, rating: 4 });

      const votes = votingService.getVotesForAd(ad.id);

      expect(votes[0].id).toBe(vote2.id); // Most recent first
    });
  });

  describe('getUserVotes', () => {
    it('should retrieve all votes by a user', () => {
      const user = createTestUser(testDb);
      const ad1 = createTestAd(testDb);
      const ad2 = createTestAd(testDb);

      createTestVote(testDb, { ad_id: ad1.id, user_id: user.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad2.id, user_id: user.id, rating: 4 });

      const votes = votingService.getUserVotes(user.id);

      expect(votes).toHaveLength(2);
      expect(votes.every(v => v.user_id === user.id)).toBe(true);
    });

    it('should return empty array for user with no votes', () => {
      const user = createTestUser(testDb);

      const votes = votingService.getUserVotes(user.id);

      expect(votes).toHaveLength(0);
    });
  });

  describe('getVoteStats', () => {
    it('should calculate correct vote statistics', () => {
      const ad = createTestAd(testDb);

      createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, rating: 4 });
      createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, rating: 3 });
      createTestVote(testDb, { ad_id: ad.id, rating: 5 });

      const stats = votingService.getVoteStats(ad.id);

      expect(stats.ad_id).toBe(ad.id);
      expect(stats.total_votes).toBe(5);
      expect(stats.average_rating).toBe(4.4); // (5+4+5+3+5)/5 = 4.4
      expect(stats.rating_distribution[5]).toBe(3);
      expect(stats.rating_distribution[4]).toBe(1);
      expect(stats.rating_distribution[3]).toBe(1);
      expect(stats.rating_distribution[2]).toBe(0);
      expect(stats.rating_distribution[1]).toBe(0);
    });

    it('should return zero stats for ad with no votes', () => {
      const ad = createTestAd(testDb);

      const stats = votingService.getVoteStats(ad.id);

      expect(stats.total_votes).toBe(0);
      expect(stats.average_rating).toBe(0);
      expect(stats.rating_distribution[1]).toBe(0);
      expect(stats.rating_distribution[2]).toBe(0);
      expect(stats.rating_distribution[3]).toBe(0);
      expect(stats.rating_distribution[4]).toBe(0);
      expect(stats.rating_distribution[5]).toBe(0);
    });
  });

  describe('deleteVote', () => {
    it('should delete an existing vote', () => {
      const ad = createTestAd(testDb);
      const vote = createTestVote(testDb, { ad_id: ad.id, rating: 5 });

      votingService.deleteVote(vote.id);

      const deletedVote = votingService.getVoteById(vote.id);
      expect(deletedVote).toBeNull();
    });

    it('should throw error when deleting non-existent vote', () => {
      expect(() => votingService.deleteVote('non-existent-id')).toThrow(AppError);
      expect(() => votingService.deleteVote('non-existent-id')).toThrow('Vote not found');
    });

    it('should recalculate ad rating after vote deletion', () => {
      const ad = createTestAd(testDb);
      const vote1 = createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      const vote2 = createTestVote(testDb, { ad_id: ad.id, rating: 3 });

      // Update ad stats
      testDb.prepare('UPDATE ads SET total_votes = 2, average_rating = 4 WHERE id = ?').run(ad.id);

      votingService.deleteVote(vote1.id);

      const updatedAd = testDb.prepare('SELECT * FROM ads WHERE id = ?').get(ad.id) as any;
      expect(updatedAd.total_votes).toBe(1);
      expect(updatedAd.average_rating).toBe(3);
    });
  });

  describe('getRecentVotes', () => {
    it('should retrieve recent votes with default limit', () => {
      const ad = createTestAd(testDb);

      for (let i = 0; i < 5; i++) {
        createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      }

      const recentVotes = votingService.getRecentVotes();

      expect(recentVotes).toHaveLength(5);
    });

    it('should respect custom limit', () => {
      const ad = createTestAd(testDb);

      for (let i = 0; i < 10; i++) {
        createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      }

      const recentVotes = votingService.getRecentVotes(3);

      expect(recentVotes).toHaveLength(3);
    });

    it('should return votes in descending order by created_at', () => {
      const ad = createTestAd(testDb);

      const vote1 = createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      const vote2 = createTestVote(testDb, { ad_id: ad.id, rating: 4 });
      const vote3 = createTestVote(testDb, { ad_id: ad.id, rating: 3 });

      const recentVotes = votingService.getRecentVotes(10);

      expect(recentVotes[0].id).toBe(vote3.id);
      expect(recentVotes[1].id).toBe(vote2.id);
      expect(recentVotes[2].id).toBe(vote1.id);
    });
  });

  describe('hasIpVotedForAd', () => {
    it('should return true if IP has voted on ad', () => {
      const ad = createTestAd(testDb);
      const ip = '192.168.1.100';

      createTestVote(testDb, { ad_id: ad.id, rating: 5, user_ip: ip });

      const hasVoted = votingService.hasIpVotedForAd(ip, ad.id);

      expect(hasVoted).toBe(true);
    });

    it('should return false if IP has not voted on ad', () => {
      const ad = createTestAd(testDb);
      const ip = '192.168.1.100';

      const hasVoted = votingService.hasIpVotedForAd(ip, ad.id);

      expect(hasVoted).toBe(false);
    });

    it('should only check votes without user_id', () => {
      const ad = createTestAd(testDb);
      const user = createTestUser(testDb);
      const ip = '192.168.1.100';

      // Create vote with user_id (authenticated user)
      createTestVote(testDb, { ad_id: ad.id, user_id: user.id, rating: 5, user_ip: ip });

      const hasVoted = votingService.hasIpVotedForAd(ip, ad.id);

      expect(hasVoted).toBe(false); // Should not count authenticated votes
    });

    it('should check specific ad, not all ads', () => {
      const ad1 = createTestAd(testDb);
      const ad2 = createTestAd(testDb);
      const ip = '192.168.1.100';

      createTestVote(testDb, { ad_id: ad1.id, rating: 5, user_ip: ip });

      const hasVotedAd1 = votingService.hasIpVotedForAd(ip, ad1.id);
      const hasVotedAd2 = votingService.hasIpVotedForAd(ip, ad2.id);

      expect(hasVotedAd1).toBe(true);
      expect(hasVotedAd2).toBe(false);
    });
  });
});
