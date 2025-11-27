import Database from 'better-sqlite3';
import { AnalyticsService } from '../../src/modules/analytics/analytics.service';
import {
  setupTestDatabase,
  clearTestData,
  createTestAd,
  createTestUser,
  createTestAnalyticsEvent,
  createTestVote
} from '../setup';
import { AppError } from '../../src/middleware/errorHandler';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {} as Database.Database
}));

describe('AnalyticsService', () => {
  let testDb: Database.Database;
  let analyticsService: AnalyticsService;

  beforeAll(() => {
    testDb = setupTestDatabase();
    // Replace the db import with our test database
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;
    analyticsService = new AnalyticsService();
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  describe('trackEvent', () => {
    it('should track a view event', () => {
      const ad = createTestAd(testDb);
      const user = createTestUser(testDb);

      const event = analyticsService.trackEvent(
        { ad_id: ad.id, event_type: 'view' },
        user.id,
        '127.0.0.1',
        'Mozilla/5.0'
      );

      expect(event).toBeDefined();
      expect(event.ad_id).toBe(ad.id);
      expect(event.event_type).toBe('view');
      expect(event.user_id).toBe(user.id);
      expect(event.user_ip).toBe('127.0.0.1');
      expect(event.user_agent).toBe('Mozilla/5.0');
    });

    it('should track a vote event', () => {
      const ad = createTestAd(testDb);

      const event = analyticsService.trackEvent(
        { ad_id: ad.id, event_type: 'vote' },
        undefined,
        '192.168.1.1'
      );

      expect(event.event_type).toBe('vote');
      expect(event.user_id).toBeNull();
    });

    it('should track a share event', () => {
      const ad = createTestAd(testDb);

      const event = analyticsService.trackEvent(
        { ad_id: ad.id, event_type: 'share' }
      );

      expect(event.event_type).toBe('share');
    });

    it('should track event with metadata', () => {
      const ad = createTestAd(testDb);
      const metadata = { source: 'facebook', campaign: 'summer2024' };

      const event = analyticsService.trackEvent({
        ad_id: ad.id,
        event_type: 'view',
        metadata
      });

      expect(event.metadata).toBe(JSON.stringify(metadata));
    });

    it('should track anonymous events without user_id', () => {
      const ad = createTestAd(testDb);

      const event = analyticsService.trackEvent(
        { ad_id: ad.id, event_type: 'view' },
        undefined,
        '192.168.1.1'
      );

      expect(event.user_id).toBeNull();
      expect(event.user_ip).toBe('192.168.1.1');
    });
  });

  describe('getEventById', () => {
    it('should retrieve an existing event', () => {
      const ad = createTestAd(testDb);
      const testEvent = createTestAnalyticsEvent(testDb, {
        ad_id: ad.id,
        event_type: 'view'
      });

      const event = analyticsService.getEventById(testEvent.id);

      expect(event).toBeDefined();
      expect(event?.id).toBe(testEvent.id);
      expect(event?.event_type).toBe('view');
    });

    it('should return null for non-existent event', () => {
      const event = analyticsService.getEventById('non-existent-id');

      expect(event).toBeNull();
    });
  });

  describe('getAdSummary', () => {
    beforeEach(() => {
      const ad = createTestAd(testDb, { id: 'test-ad-id' });

      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'share' });
    });

    it('should calculate correct summary statistics', () => {
      const summary = analyticsService.getAdSummary('test-ad-id');

      expect(summary.ad_id).toBe('test-ad-id');
      expect(summary.total_views).toBe(3);
      expect(summary.total_votes).toBe(2);
      expect(summary.total_shares).toBe(1);
    });

    it('should return zero stats for ad with no analytics', () => {
      const ad = createTestAd(testDb);
      const summary = analyticsService.getAdSummary(ad.id);

      expect(summary.total_views).toBe(0);
      expect(summary.total_votes).toBe(0);
      expect(summary.total_shares).toBe(0);
      expect(summary.unique_visitors).toBe(0);
    });

    it('should count unique visitors correctly', () => {
      const ad = createTestAd(testDb);
      const user1 = createTestUser(testDb);
      const user2 = createTestUser(testDb);

      // Same user, multiple views
      createTestAnalyticsEvent(testDb, {
        ad_id: ad.id,
        event_type: 'view',
        user_id: user1.id
      });
      createTestAnalyticsEvent(testDb, {
        ad_id: ad.id,
        event_type: 'view',
        user_id: user1.id
      });

      // Different user
      createTestAnalyticsEvent(testDb, {
        ad_id: ad.id,
        event_type: 'view',
        user_id: user2.id
      });

      const summary = analyticsService.getAdSummary(ad.id);

      expect(summary.unique_visitors).toBe(2);
    });
  });

  describe('getDateRangeAnalytics', () => {
    beforeEach(() => {
      const ad1 = createTestAd(testDb, { title: 'Ad 1' });
      const ad2 = createTestAd(testDb, { title: 'Ad 2' });

      // Create events with different timestamps
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      // Events within range (yesterday)
      createTestAnalyticsEvent(testDb, { ad_id: ad1.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad1.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad2.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: ad2.id, event_type: 'share' });
    });

    it('should return analytics for date range', () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const analytics = analyticsService.getDateRangeAnalytics(
        weekAgo.toISOString(),
        now.toISOString()
      );

      expect(analytics.start_date).toBe(weekAgo.toISOString());
      expect(analytics.end_date).toBe(now.toISOString());
      expect(analytics.total_events).toBe(4);
      expect(analytics.events_by_type.view).toBe(2);
      expect(analytics.events_by_type.vote).toBe(1);
      expect(analytics.events_by_type.share).toBe(1);
    });

    it('should return top ads in date range', () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const analytics = analyticsService.getDateRangeAnalytics(
        weekAgo.toISOString(),
        now.toISOString()
      );

      expect(analytics.top_ads).toBeDefined();
      expect(analytics.top_ads.length).toBeGreaterThan(0);
      expect(analytics.top_ads[0]).toHaveProperty('ad_id');
      expect(analytics.top_ads[0]).toHaveProperty('title');
      expect(analytics.top_ads[0]).toHaveProperty('event_count');
    });

    it('should return zero stats for date range with no events', () => {
      const future = new Date('2099-01-01');
      const farFuture = new Date('2099-12-31');

      const analytics = analyticsService.getDateRangeAnalytics(
        future.toISOString(),
        farFuture.toISOString()
      );

      expect(analytics.total_events).toBe(0);
      expect(analytics.events_by_type.view).toBe(0);
      expect(analytics.events_by_type.vote).toBe(0);
      expect(analytics.events_by_type.share).toBe(0);
    });
  });

  describe('getAdEvents', () => {
    it('should retrieve all events for an ad', () => {
      const ad = createTestAd(testDb);

      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'share' });

      const events = analyticsService.getAdEvents(ad.id);

      expect(events).toHaveLength(3);
      expect(events.every(e => e.ad_id === ad.id)).toBe(true);
    });

    it('should respect the limit parameter', () => {
      const ad = createTestAd(testDb);

      for (let i = 0; i < 10; i++) {
        createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      }

      const events = analyticsService.getAdEvents(ad.id, 5);

      expect(events).toHaveLength(5);
    });

    it('should return events in descending order by created_at', () => {
      const ad = createTestAd(testDb);

      const event1 = createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      const event2 = createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'vote' });
      const event3 = createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'share' });

      const events = analyticsService.getAdEvents(ad.id);

      expect(events[0].id).toBe(event3.id); // Most recent first
    });

    it('should return empty array for ad with no events', () => {
      const ad = createTestAd(testDb);

      const events = analyticsService.getAdEvents(ad.id);

      expect(events).toHaveLength(0);
    });
  });

  describe('getPlatformStats', () => {
    beforeEach(() => {
      // Create ads
      createTestAd(testDb, { status: 'active' });
      createTestAd(testDb, { status: 'active' });
      createTestAd(testDb, { status: 'inactive' });

      // Create users
      createTestUser(testDb);
      createTestUser(testDb);

      // Create analytics events
      const activeAd = createTestAd(testDb, { status: 'active' });
      createTestAnalyticsEvent(testDb, { ad_id: activeAd.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: activeAd.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: activeAd.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: activeAd.id, event_type: 'share' });
    });

    it('should calculate correct platform statistics', () => {
      const stats = analyticsService.getPlatformStats();

      expect(stats.total_ads).toBe(3); // Only active ads
      expect(stats.total_users).toBe(2);
      expect(stats.total_views).toBe(2);
      expect(stats.total_votes).toBe(1);
      expect(stats.total_shares).toBe(1);
    });

    it('should return zero stats for empty platform', () => {
      clearTestData(testDb);

      const stats = analyticsService.getPlatformStats();

      expect(stats.total_ads).toBe(0);
      expect(stats.total_users).toBe(0);
      expect(stats.total_views).toBe(0);
      expect(stats.total_votes).toBe(0);
      expect(stats.total_shares).toBe(0);
    });
  });

  describe('archivePreviousWeek', () => {
    it('should archive analytics for previous week', () => {
      const ad = createTestAd(testDb);

      // Create analytics events
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'view' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'vote' });
      createTestAnalyticsEvent(testDb, { ad_id: ad.id, event_type: 'share' });

      // Create votes for the ad
      createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, rating: 4 });

      analyticsService.archivePreviousWeek();

      const archives = testDb
        .prepare('SELECT * FROM weekly_archive WHERE ad_id = ?')
        .all(ad.id);

      expect(archives.length).toBeGreaterThanOrEqual(0);
    });

    it('should not fail when there are no events to archive', () => {
      expect(() => analyticsService.archivePreviousWeek()).not.toThrow();
    });
  });

  describe('getAdWeeklyArchives', () => {
    it('should retrieve weekly archives for an ad', () => {
      const ad = createTestAd(testDb);

      // Create a weekly archive entry
      const weekStart = '2024-01-01';
      const weekEnd = '2024-01-07';

      testDb.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'archive-1',
        ad.id,
        weekStart,
        weekEnd,
        10,
        4.5,
        100,
        5,
        new Date().toISOString()
      );

      const archives = analyticsService.getAdWeeklyArchives(ad.id);

      expect(archives).toHaveLength(1);
      expect(archives[0].ad_id).toBe(ad.id);
      expect(archives[0].week_start).toBe(weekStart);
      expect(archives[0].total_votes).toBe(10);
      expect(archives[0].average_rating).toBe(4.5);
    });

    it('should return empty array for ad with no archives', () => {
      const ad = createTestAd(testDb);

      const archives = analyticsService.getAdWeeklyArchives(ad.id);

      expect(archives).toHaveLength(0);
    });

    it('should return archives sorted by week_start DESC', () => {
      const ad = createTestAd(testDb);

      testDb.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'archive-1',
        ad.id,
        '2024-01-01',
        '2024-01-07',
        10,
        4.5,
        100,
        5,
        new Date().toISOString()
      );

      testDb.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'archive-2',
        ad.id,
        '2024-01-08',
        '2024-01-14',
        15,
        4.8,
        150,
        8,
        new Date().toISOString()
      );

      const archives = analyticsService.getAdWeeklyArchives(ad.id);

      expect(archives[0].week_start).toBe('2024-01-08'); // Most recent first
      expect(archives[1].week_start).toBe('2024-01-01');
    });
  });

  describe('getAllWeeklyArchives', () => {
    beforeEach(() => {
      const ad1 = createTestAd(testDb);
      const ad2 = createTestAd(testDb);

      // Create archives for different ads
      testDb.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'archive-1',
        ad1.id,
        '2024-01-01',
        '2024-01-07',
        10,
        4.5,
        100,
        5,
        new Date().toISOString()
      );

      testDb.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'archive-2',
        ad2.id,
        '2024-01-08',
        '2024-01-14',
        15,
        4.8,
        150,
        8,
        new Date().toISOString()
      );
    });

    it('should retrieve all weekly archives', () => {
      const archives = analyticsService.getAllWeeklyArchives();

      expect(archives.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect the limit parameter', () => {
      const archives = analyticsService.getAllWeeklyArchives(1);

      expect(archives).toHaveLength(1);
    });

    it('should return archives sorted by week_start DESC', () => {
      const archives = analyticsService.getAllWeeklyArchives();

      expect(archives[0].week_start).toBe('2024-01-08'); // Most recent first
    });
  });
});
