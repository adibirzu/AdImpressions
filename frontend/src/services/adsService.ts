import apiClient from './api';
import { Ad, AdFormData, AdFilters, PaginatedResponse } from '../types';

export const adsService = {
  // Get all ads with optional filters
  getAds: async (filters?: AdFilters): Promise<PaginatedResponse<Ad>> => {
    const params = new URLSearchParams();
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.filter_by) params.append('filter_by', filters.filter_by);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());

    const response = await apiClient.get<PaginatedResponse<Ad>>(`/ads?${params.toString()}`);
    return response.data;
  },

  // Get single ad by ID
  getAdById: async (id: string): Promise<Ad> => {
    const response = await apiClient.get<Ad>(`/ads/${id}`);
    return response.data;
  },

  // Create new ad
  createAd: async (data: AdFormData): Promise<Ad> => {
    const response = await apiClient.post<Ad>('/ads', data);
    return response.data;
  },

  // Update ad
  updateAd: async (id: string, data: Partial<AdFormData>): Promise<Ad> => {
    const response = await apiClient.put<Ad>(`/ads/${id}`, data);
    return response.data;
  },

  // Delete ad
  deleteAd: async (id: string): Promise<void> => {
    await apiClient.delete(`/ads/${id}`);
  },

  // Approve ad (admin only)
  approveAd: async (id: string): Promise<Ad> => {
    const response = await apiClient.post<Ad>(`/ads/${id}/approve`);
    return response.data;
  },

  // Reject ad (admin only)
  rejectAd: async (id: string): Promise<Ad> => {
    const response = await apiClient.post<Ad>(`/ads/${id}/reject`);
    return response.data;
  },

  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/ads/${id}/view`);
  },

  // Get trending ads
  getTrendingAds: async (limit: number = 10): Promise<Ad[]> => {
    const response = await apiClient.get<Ad[]>(`/ads/trending?limit=${limit}`);
    return response.data;
  },

  // Get top rated ads
  getTopRatedAds: async (limit: number = 10): Promise<Ad[]> => {
    const response = await apiClient.get<Ad[]>(`/ads/top-rated?limit=${limit}`);
    return response.data;
  },
};

export default adsService;
