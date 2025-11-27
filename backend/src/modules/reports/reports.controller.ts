import { Request, Response } from 'express';
import reportsService from './reports.service';
import { CreateReportDTO, UpdateReportDTO, ReportFilters, ReportStatus } from './reports.types';
import { AppError } from '../../middleware/errorHandler';

export class ReportsController {
  /**
   * POST /api/ads/:adId/report
   * Create a new report for an ad
   */
  async createReport(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const data: CreateReportDTO = req.body;

      if (!data.reason) {
        throw new AppError('Reason is required', 400);
      }

      // Get user ID from auth (if authenticated) or null for anonymous reports
      const userId = (req as any).user?.id || null;

      const report = reportsService.createReport(adId, userId, data);

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/reports
   * Get all reports (admin only)
   */
  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        status: req.query.status as ReportStatus,
        adId: req.query.adId as string,
        userId: req.query.userId as string,
        reason: req.query.reason as any
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { reports, total } = reportsService.getReports(filters, page, limit);

      res.json({
        success: true,
        count: reports.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: reports
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/reports/:id
   * Get a single report by ID (admin only)
   */
  async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = reportsService.getReportById(id);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/reports/:id
   * Update report status (admin only)
   */
  async updateReportStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateReportDTO;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      if (!Object.values(ReportStatus).includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const report = reportsService.updateReportStatus(id, status);

      res.json({
        success: true,
        message: 'Report status updated successfully',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/:adId/reports
   * Get all reports for a specific ad (admin only)
   */
  async getReportsByAdId(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const reports = reportsService.getReportsByAdId(adId);

      res.json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/reports/stats
   * Get report statistics (admin only)
   */
  async getReportStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = reportsService.getReportStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/reports/:id
   * Delete a report (admin only)
   */
  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      reportsService.deleteReport(id);

      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new ReportsController();
