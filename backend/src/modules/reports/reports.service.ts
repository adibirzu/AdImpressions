import { db } from '../../config/database';
import { Report, CreateReportDTO, UpdateReportDTO, ReportFilters, ReportWithAdInfo, ReportStatus } from './reports.types';
import { generateId } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';
import adsService from '../ads/ads.service';

export class ReportsService {
  /**
   * Create a new report
   */
  createReport(adId: string, userId: string | null, data: CreateReportDTO): Report {
    // Check if ad exists
    const ad = adsService.getAdById(adId);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }

    // Check if user has already reported this ad
    if (userId && this.hasUserReportedAd(userId, adId)) {
      throw new AppError('You have already reported this ad', 400);
    }

    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO reports (
        id, ad_id, user_id, reason, description, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      adId,
      userId,
      data.reason,
      data.description || null,
      ReportStatus.PENDING,
      now,
      now
    );

    const report = this.getReportById(id);
    if (!report) {
      throw new AppError('Failed to create report', 500);
    }

    return report;
  }

  /**
   * Get a single report by ID
   */
  getReportById(id: string): Report | null {
    const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
    const report = stmt.get(id) as Report | undefined;
    return report || null;
  }

  /**
   * Get all reports with optional filtering and pagination
   */
  getReports(filters?: ReportFilters, page: number = 1, limit: number = 20): { reports: ReportWithAdInfo[], total: number } {
    let query = `
      SELECT
        r.*,
        a.title as ad_title,
        a.brand as ad_brand,
        u.username as reporter_username
      FROM reports r
      LEFT JOIN ads a ON r.ad_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }

    if (filters?.adId) {
      query += ' AND r.ad_id = ?';
      params.push(filters.adId);
    }

    if (filters?.userId) {
      query += ' AND r.user_id = ?';
      params.push(filters.userId);
    }

    if (filters?.reason) {
      query += ' AND r.reason = ?';
      params.push(filters.reason);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT r.*, a.title as ad_title, a.brand as ad_brand, u.username as reporter_username',
      'SELECT COUNT(*) as count'
    );
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...params) as { count: number };
    const total = countResult.count;

    // Add pagination
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const reports = stmt.all(...params) as ReportWithAdInfo[];

    return { reports, total };
  }

  /**
   * Update report status
   */
  updateReportStatus(id: string, status: ReportStatus): Report {
    const existingReport = this.getReportById(id);
    if (!existingReport) {
      throw new AppError('Report not found', 404);
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE reports
      SET status = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(status, now, id);

    const updatedReport = this.getReportById(id);
    if (!updatedReport) {
      throw new AppError('Failed to update report', 500);
    }

    return updatedReport;
  }

  /**
   * Get reports for a specific ad
   */
  getReportsByAdId(adId: string): Report[] {
    const stmt = db.prepare(`
      SELECT * FROM reports
      WHERE ad_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(adId) as Report[];
  }

  /**
   * Check if user has already reported an ad
   */
  hasUserReportedAd(userId: string, adId: string): boolean {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM reports
      WHERE user_id = ? AND ad_id = ?
    `);

    const result = stmt.get(userId, adId) as { count: number };
    return result.count > 0;
  }

  /**
   * Get report statistics
   */
  getReportStatistics(): {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    reportsByReason: { reason: string; count: number }[];
  } {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM reports');
    const total = (totalStmt.get() as { count: number }).count;

    const pendingStmt = db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?');
    const pending = (pendingStmt.get(ReportStatus.PENDING) as { count: number }).count;

    const resolvedStmt = db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?');
    const resolved = (resolvedStmt.get(ReportStatus.RESOLVED) as { count: number }).count;

    const dismissedStmt = db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?');
    const dismissed = (dismissedStmt.get(ReportStatus.DISMISSED) as { count: number }).count;

    const reasonStmt = db.prepare(`
      SELECT reason, COUNT(*) as count
      FROM reports
      GROUP BY reason
      ORDER BY count DESC
    `);
    const reportsByReason = reasonStmt.all() as { reason: string; count: number }[];

    return {
      totalReports: total,
      pendingReports: pending,
      resolvedReports: resolved,
      dismissedReports: dismissed,
      reportsByReason
    };
  }

  /**
   * Delete a report
   */
  deleteReport(id: string): void {
    const report = this.getReportById(id);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
    stmt.run(id);
  }
}

export default new ReportsService();
