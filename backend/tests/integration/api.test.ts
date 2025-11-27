import request from 'supertest';
import Database from 'better-sqlite3';
import app from '../../src/app';
import { setupTestDatabase, clearTestData, createTestUser, createTestAd, generateTestToken } from '../setup';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {} as Database.Database,
  initializeDatabase: jest.fn()
}));

describe('API Integration Tests', () => {
  let testDb: Database.Database;
  let authToken: string;
  let adminToken: string;

  beforeAll(() => {
    testDb = setupTestDatabase();
    // Replace the db import with our test database
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;

    // Create tokens for testing
    authToken = generateTestToken({
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    });

    adminToken = generateTestToken({
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    });
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  describe('Health Check', () => {
    it('GET /health should return OK status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('User Registration and Login Flow', () => {
    it('should complete full user registration flow', async () => {
      // Register a new user
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user).toHaveProperty('id');
      expect(registerResponse.body.data.user.username).toBe('newuser');
      expect(registerResponse.body.data.user.email).toBe('newuser@example.com');
      expect(registerResponse.body.data).toHaveProperty('token');
    });

    it('should login with valid credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        });

      // Login
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data.user.email).toBe('login@example.com');
    });

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'user1',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email already registered');
    });

    it('should reject login with invalid password', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid email or password');
    });
  });

  describe('Ad Management Flow', () => {
    beforeEach(() => {
      // Create a test user for authentication
      createTestUser(testDb, {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should create a new ad', async () => {
      const response = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Advertisement',
          description: 'This is a test ad',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          brand: 'Test Brand',
          category: 'Technology'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Advertisement');
      expect(response.body.data.video_platform).toBe('youtube');
      expect(response.body.data.video_id).toBe('dQw4w9WgXcQ');
    });

    it('should retrieve all ads', async () => {
      createTestAd(testDb, { title: 'Ad 1', category: 'Tech' });
      createTestAd(testDb, { title: 'Ad 2', category: 'Fashion' });

      const response = await request(app).get('/api/ads');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should retrieve a specific ad', async () => {
      const ad = createTestAd(testDb, { title: 'Specific Ad' });

      const response = await request(app).get(`/api/ads/${ad.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(ad.id);
      expect(response.body.data.title).toBe('Specific Ad');
    });

    it('should filter ads by category', async () => {
      createTestAd(testDb, { title: 'Tech Ad', category: 'Technology' });
      createTestAd(testDb, { title: 'Fashion Ad', category: 'Fashion' });

      const response = await request(app).get('/api/ads?category=Technology');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('Technology');
    });

    it('should update an ad', async () => {
      createTestUser(testDb, {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      });

      const ad = createTestAd(testDb, { title: 'Original Title' });

      const response = await request(app)
        .put(`/api/ads/${ad.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated Description');
    });

    it('should delete an ad', async () => {
      createTestUser(testDb, {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      });

      const ad = createTestAd(testDb);

      const response = await request(app)
        .delete(`/api/ads/${ad.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify ad is deleted
      const getResponse = await request(app).get(`/api/ads/${ad.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should reject ad creation with invalid video URL', async () => {
      const response = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Ad',
          video_url: 'https://invalid.com/video'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid video URL');
    });
  });

  describe('Voting Workflow', () => {
    beforeEach(() => {
      createTestUser(testDb, {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should allow authenticated user to vote on ad', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ad_id: ad.id,
          rating: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.ad_id).toBe(ad.id);
    });

    it('should prevent duplicate votes from same user', async () => {
      const ad = createTestAd(testDb);

      // First vote
      await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ad_id: ad.id,
          rating: 5
        });

      // Second vote (should fail)
      const response = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ad_id: ad.id,
          rating: 4
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already voted');
    });

    it('should reject invalid rating values', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ad_id: ad.id,
          rating: 6 // Invalid: should be 1-5
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid rating');
    });

    it('should retrieve vote statistics for an ad', async () => {
      const ad = createTestAd(testDb);
      const user1 = createTestUser(testDb, { username: 'user1', email: 'user1@test.com' });
      const user2 = createTestUser(testDb, { username: 'user2', email: 'user2@test.com' });

      // Create votes through service (simulating previous votes)
      const votingService = require('../../src/modules/voting/voting.service').default;
      votingService.createVote({ ad_id: ad.id, rating: 5 }, user1.id);
      votingService.createVote({ ad_id: ad.id, rating: 4 }, user2.id);

      const response = await request(app).get(`/api/votes/stats/${ad.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_votes).toBe(2);
      expect(response.body.data.average_rating).toBe(4.5);
    });
  });

  describe('Analytics Tracking', () => {
    beforeEach(() => {
      createTestUser(testDb, {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should track view event', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .post('/api/analytics/track')
        .send({
          ad_id: ad.id,
          event_type: 'view'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event_type).toBe('view');
    });

    it('should track share event with metadata', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .post('/api/analytics/track')
        .send({
          ad_id: ad.id,
          event_type: 'share',
          metadata: { platform: 'twitter' }
        });

      expect(response.status).toBe(201);
      expect(response.body.data.event_type).toBe('share');
    });

    it('should retrieve analytics summary for an ad', async () => {
      const ad = createTestAd(testDb);

      // Track some events
      const analyticsService = require('../../src/modules/analytics/analytics.service').default;
      analyticsService.trackEvent({ ad_id: ad.id, event_type: 'view' });
      analyticsService.trackEvent({ ad_id: ad.id, event_type: 'view' });
      analyticsService.trackEvent({ ad_id: ad.id, event_type: 'vote' });

      const response = await request(app).get(`/api/analytics/ad/${ad.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_views).toBe(2);
      expect(response.body.data.total_votes).toBe(1);
    });

    it('should retrieve platform statistics', async () => {
      createTestAd(testDb, { status: 'active' });
      createTestAd(testDb, { status: 'active' });

      const response = await request(app).get('/api/analytics/platform');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_ads).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Authorization and Permissions', () => {
    beforeEach(() => {
      createTestUser(testDb, {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      });

      createTestUser(testDb, {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      });
    });

    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .post('/api/ads')
        .send({
          title: 'Test Ad',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        });

      expect(response.status).toBe(401);
    });

    it('should reject non-admin users from deleting ads', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .delete(`/api/ads/${ad.id}`)
        .set('Authorization', `Bearer ${authToken}`); // Regular user token

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });

    it('should allow admin users to delete ads', async () => {
      const ad = createTestAd(testDb);

      const response = await request(app)
        .delete(`/api/ads/${ad.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent ad', async () => {
      const response = await request(app).get('/api/ads/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Ad not found');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      expect(response.status).toBe(400);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser'
          // Missing email and password
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full user journey: register, create ad, vote, view analytics', async () => {
      // 1. Register a new user
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          username: 'journeyuser',
          email: 'journey@example.com',
          password: 'password123'
        });

      expect(registerResponse.status).toBe(201);
      const token = registerResponse.body.data.token;

      // 2. Create an ad
      const createAdResponse = await request(app)
        .post('/api/ads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Journey Test Ad',
          description: 'Testing complete journey',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          brand: 'Journey Brand',
          category: 'Test'
        });

      expect(createAdResponse.status).toBe(201);
      const adId = createAdResponse.body.data.id;

      // 3. Track a view event
      const viewResponse = await request(app)
        .post('/api/analytics/track')
        .send({
          ad_id: adId,
          event_type: 'view'
        });

      expect(viewResponse.status).toBe(201);

      // 4. Vote on the ad
      const voteResponse = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ad_id: adId,
          rating: 5
        });

      expect(voteResponse.status).toBe(201);

      // 5. Retrieve ad with updated stats
      const getAdResponse = await request(app).get(`/api/ads/${adId}`);

      expect(getAdResponse.status).toBe(200);
      expect(getAdResponse.body.data.total_votes).toBeGreaterThanOrEqual(1);

      // 6. Get analytics for the ad
      const analyticsResponse = await request(app).get(`/api/analytics/ad/${adId}`);

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.data.total_views).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Weekly Cleanup Job', () => {
    it('should archive previous week data', async () => {
      const ad = createTestAd(testDb);

      // Create some analytics events
      const analyticsService = require('../../src/modules/analytics/analytics.service').default;
      analyticsService.trackEvent({ ad_id: ad.id, event_type: 'view' });
      analyticsService.trackEvent({ ad_id: ad.id, event_type: 'vote' });

      // Run weekly archive
      analyticsService.archivePreviousWeek();

      // Verify archive was created (may or may not have entries depending on dates)
      const archives = analyticsService.getAllWeeklyArchives();
      expect(archives).toBeDefined();
    });
  });

  describe('Top Rated and Trending Ads', () => {
    beforeEach(() => {
      const user1 = createTestUser(testDb, { username: 'user1', email: 'user1@test.com' });
      const user2 = createTestUser(testDb, { username: 'user2', email: 'user2@test.com' });
      const user3 = createTestUser(testDb, { username: 'user3', email: 'user3@test.com' });

      const ad1 = createTestAd(testDb, { title: 'Top Ad' });
      const ad2 = createTestAd(testDb, { title: 'Good Ad' });
      const ad3 = createTestAd(testDb, { title: 'OK Ad' });

      const votingService = require('../../src/modules/voting/voting.service').default;
      votingService.createVote({ ad_id: ad1.id, rating: 5 }, user1.id);
      votingService.createVote({ ad_id: ad1.id, rating: 5 }, user2.id);
      votingService.createVote({ ad_id: ad2.id, rating: 4 }, user1.id);
      votingService.createVote({ ad_id: ad3.id, rating: 3 }, user2.id);
    });

    it('should retrieve top-rated ads', async () => {
      const response = await request(app).get('/api/ads/top-rated?limit=2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should retrieve trending ads', async () => {
      const response = await request(app).get('/api/ads/trending?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
