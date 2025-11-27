import { Router } from 'express';
import reportsController from './reports.controller';
import { authenticate, requireAdmin, optionalAuthenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Public routes (with optional authentication)
// POST /api/ads/:adId/report - Report an ad
router.post('/ads/:adId/report', optionalAuthenticate, asyncHandler(reportsController.createReport.bind(reportsController)));

// Admin-only routes
// GET /api/reports - List all reports
router.get('/reports', authenticate, requireAdmin, asyncHandler(reportsController.getReports.bind(reportsController)));

// GET /api/reports/stats - Get report statistics
router.get('/reports/stats', authenticate, requireAdmin, asyncHandler(reportsController.getReportStatistics.bind(reportsController)));

// GET /api/reports/:id - Get a single report
router.get('/reports/:id', authenticate, requireAdmin, asyncHandler(reportsController.getReportById.bind(reportsController)));

// PUT /api/reports/:id - Update report status
router.put('/reports/:id', authenticate, requireAdmin, asyncHandler(reportsController.updateReportStatus.bind(reportsController)));

// DELETE /api/reports/:id - Delete a report
router.delete('/reports/:id', authenticate, requireAdmin, asyncHandler(reportsController.deleteReport.bind(reportsController)));

// GET /api/ads/:adId/reports - Get all reports for a specific ad
router.get('/ads/:adId/reports', authenticate, requireAdmin, asyncHandler(reportsController.getReportsByAdId.bind(reportsController)));

export default router;
