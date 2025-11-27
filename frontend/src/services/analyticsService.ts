import apiClient from './api';
import { DailyStats, WeeklyReport, AdAnalytics } from '../types';

export const analyticsService = {
  // Get daily statistics
  getDailyStats: async (startDate?: string, endDate?: string): Promise<DailyStats[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get<DailyStats[]>(`/analytics/daily?${params.toString()}`);
    return response.data;
  },

  // Get weekly report
  getWeeklyReport: async (weekStart?: string): Promise<WeeklyReport> => {
    const params = weekStart ? `?week_start=${weekStart}` : '';
    const response = await apiClient.get<WeeklyReport>(`/analytics/weekly${params}`);
    return response.data;
  },

  // Get analytics for specific ad
  getAdAnalytics: async (adId: string): Promise<AdAnalytics> => {
    const response = await apiClient.get<AdAnalytics>(`/analytics/ads/${adId}`);
    return response.data;
  },

  // Get platform overview stats
  getPlatformStats: async (): Promise<{
    total_ads: number;
    total_users: number;
    total_votes: number;
    active_users_today: number;
  }> => {
    const response = await apiClient.get('/analytics/platform');
    return response.data;
  },

  // Get most popular industries
  getPopularIndustries: async (limit: number = 10): Promise<{
    industry: string;
    ad_count: number;
    total_votes: number;
  }[]> => {
    const response = await apiClient.get(`/analytics/industries?limit=${limit}`);
    return response.data;
  },

  // Get top brands
  getTopBrands: async (limit: number = 10): Promise<{
    brand: string;
    ad_count: number;
    avg_net_votes: number;
  }[]> => {
    const response = await apiClient.get(`/analytics/brands?limit=${limit}`);
    return response.data;
  },
};

export default analyticsService;
