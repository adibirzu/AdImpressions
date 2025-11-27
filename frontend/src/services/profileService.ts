import apiClient from './api';
import { UserProfileData, UserStats, VotingHistoryResponse } from '../types';

export const profileService = {
  // Get user profile (public)
  getUserProfile: async (userId: string): Promise<UserProfileData> => {
    const response = await apiClient.get<{ success: boolean; data: UserProfileData }>(
      `/users/${userId}/profile`
    );
    return response.data.data;
  },

  // Get user's voting history
  getUserVotes: async (userId: string, page: number = 1, limit: number = 20): Promise<VotingHistoryResponse> => {
    const response = await apiClient.get<{ success: boolean; data: VotingHistoryResponse }>(
      `/users/${userId}/votes?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get current user's stats
  getMyStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<{ success: boolean; data: UserStats }>(
      `/users/me/stats`
    );
    return response.data.data;
  },
};

export default profileService;
