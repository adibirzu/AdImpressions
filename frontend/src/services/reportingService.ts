import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export enum ReportReason {
  INAPPROPRIATE = 'inappropriate',
  MISLEADING = 'misleading',
  SPAM = 'spam',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface Report {
  id: string;
  ad_id: string;
  user_id: string | null;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReportDTO {
  reason: ReportReason;
  description?: string;
}

export const reportingService = {
  /**
   * Create a new report for an ad
   */
  async createReport(
    adId: string,
    reason: ReportReason,
    description?: string
  ): Promise<Report> {
    try {
      const response = await axios.post(
        `${API_URL}/ads/${adId}/report`,
        {
          reason,
          description
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Include auth token if available
            ...(localStorage.getItem('token') && {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already reported')) {
        throw new Error('You have already reported this ad');
      }
      throw error;
    }
  },

  /**
   * Get all reports (admin only)
   */
  async getReports(
    status?: ReportStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    reports: Report[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${API_URL}/reports?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      return {
        reports: response.data.data,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(reportId: string, status: ReportStatus): Promise<Report> {
    try {
      const response = await axios.put(
        `${API_URL}/reports/${reportId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get reports for a specific ad (admin only)
   */
  async getReportsByAdId(adId: string): Promise<Report[]> {
    try {
      const response = await axios.get(`${API_URL}/ads/${adId}/reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get report statistics (admin only)
   */
  async getReportStatistics(): Promise<{
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    reportsByReason: { reason: string; count: number }[];
  }> {
    try {
      const response = await axios.get(`${API_URL}/reports/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a report (admin only)
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      throw error;
    }
  }
};
