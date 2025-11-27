import apiClient from './api';
import { Vote, VoteStats } from '../types';

export const votingService = {
  // Cast a vote
  vote: async (adId: string, voteType: 'upvote' | 'downvote'): Promise<Vote> => {
    const response = await apiClient.post<Vote>('/votes', {
      ad_id: adId,
      vote_type: voteType,
    });
    return response.data;
  },

  // Update existing vote
  updateVote: async (voteId: string, voteType: 'upvote' | 'downvote'): Promise<Vote> => {
    const response = await apiClient.put<Vote>(`/votes/${voteId}`, {
      vote_type: voteType,
    });
    return response.data;
  },

  // Remove vote
  removeVote: async (voteId: string): Promise<void> => {
    await apiClient.delete(`/votes/${voteId}`);
  },

  // Get user's vote for an ad
  getUserVote: async (adId: string): Promise<Vote | null> => {
    try {
      const response = await apiClient.get<Vote>(`/votes/ad/${adId}/user`);
      return response.data;
    } catch (error: any) {
      if (error.code === '404') {
        return null;
      }
      throw error;
    }
  },

  // Get vote stats for an ad
  getAdVoteStats: async (adId: string): Promise<VoteStats> => {
    const response = await apiClient.get<VoteStats>(`/votes/ad/${adId}/stats`);
    return response.data;
  },

  // Get all votes by user
  getUserVotes: async (userId: string): Promise<Vote[]> => {
    const response = await apiClient.get<Vote[]>(`/votes/user/${userId}`);
    return response.data;
  },
};

export default votingService;
