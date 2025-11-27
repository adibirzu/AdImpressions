import apiClient from './api';
import { Comment, CommentFormData, CommentsPaginatedResponse } from '../types';

export const commentsService = {
  // Get comments for an ad with pagination
  getCommentsByAdId: async (
    adId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CommentsPaginatedResponse> => {
    const response = await apiClient.get<{ data: CommentsPaginatedResponse }>(
      `/ads/${adId}/comments?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Create a new comment
  createComment: async (adId: string, data: CommentFormData): Promise<Comment> => {
    const response = await apiClient.post<{ data: Comment }>(
      `/ads/${adId}/comments`,
      data
    );
    return response.data.data;
  },

  // Update a comment
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const response = await apiClient.put<{ data: Comment }>(
      `/comments/${commentId}`,
      { content }
    );
    return response.data.data;
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // Get comment count for an ad
  getCommentCount: async (adId: string): Promise<number> => {
    const response = await apiClient.get<{ data: { count: number } }>(
      `/ads/${adId}/comments/count`
    );
    return response.data.data.count;
  },

  // Get a single comment by ID
  getCommentById: async (commentId: string): Promise<Comment> => {
    const response = await apiClient.get<{ data: Comment }>(
      `/comments/${commentId}`
    );
    return response.data.data;
  },

  // Get current user's comments
  getMyComments: async (): Promise<Comment[]> => {
    const response = await apiClient.get<{ data: Comment[] }>(
      '/comments/user/me'
    );
    return response.data.data;
  },

  // Get recent comments
  getRecentComments: async (limit: number = 20): Promise<Comment[]> => {
    const response = await apiClient.get<{ data: Comment[] }>(
      `/comments/recent?limit=${limit}`
    );
    return response.data.data;
  },
};

export default commentsService;
