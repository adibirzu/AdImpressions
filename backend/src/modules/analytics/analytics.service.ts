import { db } from '../../config/database';
import { AnalyticsEvent, CreateAnalyticsEventDTO, AnalyticsSummary, DateRangeAnalytics, WeeklyArchive } from './analytics.types';
import { generateId, getCurrentWeekDates, getPreviousWeekDates } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  trackEvent(
    data: CreateAnalyticsEventDTO,
    userId?: string,
    userIp?: string,
    userAgent?: string
  ): AnalyticsEvent {
    const id = generateId();
    const now = new Date().toISOString();
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null;

    const stmt = db.prepare(`
      INSERT INTO analytics (id, ad_id, event_type, user_id, user_ip, user_agent, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.ad_id,
      data.event_type,
      userId || null,
      userIp || null,
      userAgent || null,
      metadata,
      now
    );

    const event = this.getEventById(id);
    if (!event) {
      throw new AppError('Failed to create analytics event', 500);
    }

    return event;
  }

  /**
   * Get an event by ID
   */
  getEventById(id: string): AnalyticsEvent | null {
    const stmt = db.prepare('SELECT * FROM analytics WHERE id = ?');
    const event = stmt.get(id) as AnalyticsEvent | undefined;
    return event || null;
  }

  /**
   * Get analytics summary for an ad
   */
  getAdSummary(adId: string): AnalyticsSummary {
    const stmt = db.prepare(`
      SELECT
        ad_id,
        SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as total_views,
        SUM(CASE WHEN event_type = 'vote' THEN 1 ELSE 0 END) as total_votes,
        SUM(CASE WHEN event_type = 'share' THEN 1 ELSE 0 END) as total_shares,
        COUNT(DISTINCT COALESCE(user_id, user_ip)) as unique_visitors
      FROM analytics
      WHERE ad_id = ?
      GROUP BY ad_id
    `);

    const result = stmt.get(adId) as AnalyticsSummary | undefined;

    if (!result) {
      return {
        ad_id: adId,
        total_views: 0,
        total_votes: 0,
        total_shares: 0,
        unique_visitors: 0
      };
    }

    return result;
  }

  /**
   * Get analytics for a date range
   */
  getDateRangeAnalytics(startDate: string, endDate: string): DateRangeAnalytics {
    const eventsStmt = db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM analytics
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY event_type
    `);

    const events = eventsStmt.all(startDate, endDate) as { event_type: string; count: number }[];

    const eventsByType = {
      view: 0,
      vote: 0,
      share: 0
    };

    let totalEvents = 0;

    events.forEach(event => {
      eventsByType[event.event_type as keyof typeof eventsByType] = event.count;
      totalEvents += event.count;
    });

    // Get top ads
    const topAdsStmt = db.prepare(`
      SELECT a.ad_id, ads.title, COUNT(*) as event_count
      FROM analytics a
      JOIN ads ON a.ad_id = ads.id
      WHERE a.created_at >= ? AND a.created_at <= ?
      GROUP BY a.ad_id, ads.title
      ORDER BY event_count DESC
      LIMIT 10
    `);

    const topAds = topAdsStmt.all(startDate, endDate) as {
      ad_id: string;
      title: string;
      event_count: number;
    }[];

    return {
      start_date: startDate,
      end_date: endDate,
      total_events: totalEvents,
      events_by_type: eventsByType,
      top_ads: topAds
    };
  }

  /**
   * Get all events for an ad
   */
  getAdEvents(adId: string, limit: number = 100): AnalyticsEvent[] {
    const stmt = db.prepare(`
      SELECT * FROM analytics
      WHERE ad_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(adId, limit) as AnalyticsEvent[];
  }

  /**
   * Get overall platform statistics
   */
  getPlatformStats(): {
    total_ads: number;
    total_votes: number;
    total_views: number;
    total_shares: number;
    total_users: number;
  } {
    const adsStmt = db.prepare('SELECT COUNT(*) as count FROM ads WHERE status = "active"');
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const analyticsStmt = db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as total_views,
        SUM(CASE WHEN event_type = 'vote' THEN 1 ELSE 0 END) as total_votes,
        SUM(CASE WHEN event_type = 'share' THEN 1 ELSE 0 END) as total_shares
      FROM analytics
    `);

    const adsResult = adsStmt.get() as { count: number };
    const usersResult = usersStmt.get() as { count: number };
    const analyticsResult = analyticsStmt.get() as {
      total_views: number | null;
      total_votes: number | null;
      total_shares: number | null;
    };

    return {
      total_ads: adsResult.count,
      total_users: usersResult.count,
      total_views: analyticsResult.total_views || 0,
      total_votes: analyticsResult.total_votes || 0,
      total_shares: analyticsResult.total_shares || 0
    };
  }

  /**
   * Archive data for the previous week
   */
  archivePreviousWeek(): void {
    const { week_start, week_end } = getPreviousWeekDates();

    // Get all ads that had activity in the previous week
    const adsStmt = db.prepare(`
      SELECT DISTINCT ad_id FROM analytics
      WHERE created_at >= ? AND created_at <= ?
    `);

    const ads = adsStmt.all(week_start, week_end + 'T23:59:59.999Z') as { ad_id: string }[];

    ads.forEach(({ ad_id }) => {
      const summary = this.getAdSummaryForDateRange(ad_id, week_start, week_end + 'T23:59:59.999Z');

      const id = generateId();
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO weekly_archive (
          id, ad_id, week_start, week_end, total_votes, average_rating,
          total_views, total_shares, archived_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        id,
        ad_id,
        week_start,
        week_end,
        summary.total_votes,
        summary.average_rating,
        summary.total_views,
        summary.total_shares,
        now
      );
    });

    console.log(`Archived data for ${ads.length} ads from ${week_start} to ${week_end}`);
  }

  /**
   * Get ad summary for a specific date range
   */
  private getAdSummaryForDateRange(
    adId: string,
    startDate: string,
    endDate: string
  ): {
    total_votes: number;
    average_rating: number;
    total_views: number;
    total_shares: number;
  } {
    const analyticsStmt = db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as total_views,
        SUM(CASE WHEN event_type = 'vote' THEN 1 ELSE 0 END) as total_votes,
        SUM(CASE WHEN event_type = 'share' THEN 1 ELSE 0 END) as total_shares
      FROM analytics
      WHERE ad_id = ? AND created_at >= ? AND created_at <= ?
    `);

    const analyticsResult = analyticsStmt.get(adId, startDate, endDate) as {
      total_views: number | null;
      total_votes: number | null;
      total_shares: number | null;
    };

    const votesStmt = db.prepare(`
      SELECT AVG(rating) as average_rating, COUNT(*) as count
      FROM votes
      WHERE ad_id = ? AND created_at >= ? AND created_at <= ?
    `);

    const votesResult = votesStmt.get(adId, startDate, endDate) as {
      average_rating: number | null;
      count: number;
    };

    return {
      total_votes: votesResult.count || 0,
      average_rating: votesResult.average_rating
        ? Math.round(votesResult.average_rating * 100) / 100
        : 0,
      total_views: analyticsResult.total_views || 0,
      total_shares: analyticsResult.total_shares || 0
    };
  }

  /**
   * Get weekly archives for an ad
   */
  getAdWeeklyArchives(adId: string): WeeklyArchive[] {
    const stmt = db.prepare(`
      SELECT * FROM weekly_archive
      WHERE ad_id = ?
      ORDER BY week_start DESC
    `);

    return stmt.all(adId) as WeeklyArchive[];
  }

  /**
   * Get all weekly archives
   */
  getAllWeeklyArchives(limit: number = 50): WeeklyArchive[] {
    const stmt = db.prepare(`
      SELECT * FROM weekly_archive
      ORDER BY week_start DESC
      LIMIT ?
    `);

    return stmt.all(limit) as WeeklyArchive[];
  }
}

export default new AnalyticsService();
