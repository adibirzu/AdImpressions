import { Request, Response } from 'express';
import analyticsService from './analytics.service';
import { CreateAnalyticsEventDTO } from './analytics.types';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class AnalyticsController {
  /**
   * POST /api/analytics/track
   * Track an analytics event
   */
  async trackEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateAnalyticsEventDTO = req.body;

      if (!data.ad_id || !data.event_type) {
        throw new AppError('Ad ID and event type are required', 400);
      }

      const userId = req.user?.id;
      const userIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const event = analyticsService.trackEvent(data, userId, userIp, userAgent);

      res.status(201).json({
        success: true,
        message: 'Event tracked successfully',
        data: event
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/ad/:adId
   * Get analytics summary for an ad
   */
  async getAdSummary(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const summary = analyticsService.getAdSummary(adId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/ad/:adId/events
   * Get all events for an ad
   */
  async getAdEvents(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const events = analyticsService.getAdEvents(adId, limit);

      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/date-range
   * Get analytics for a date range
   */
  async getDateRangeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      const analytics = analyticsService.getDateRangeAnalytics(startDate, endDate);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/platform-stats
   * Get overall platform statistics
   */
  async getPlatformStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = analyticsService.getPlatformStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/weekly-archives
   * Get all weekly archives
   */
  async getAllWeeklyArchives(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const archives = analyticsService.getAllWeeklyArchives(limit);

      res.json({
        success: true,
        count: archives.length,
        data: archives
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/analytics/weekly-archives/:adId
   * Get weekly archives for an ad
   */
  async getAdWeeklyArchives(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const archives = analyticsService.getAdWeeklyArchives(adId);

      res.json({
        success: true,
        count: archives.length,
        data: archives
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/analytics/archive-week
   * Manually trigger weekly archive (admin only)
   */
  async archiveWeek(req: Request, res: Response): Promise<void> {
    try {
      analyticsService.archivePreviousWeek();

      res.json({
        success: true,
        message: 'Previous week archived successfully'
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new AnalyticsController();
