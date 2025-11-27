import apiClient from './api';
import { Bookmark, BookmarksPaginatedResponse, BookmarkStatus } from '../types';

export const bookmarksService = {
  // Add a bookmark
  addBookmark: async (adId: string): Promise<Bookmark> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: Bookmark }>(
      `/ads/${adId}/bookmark`
    );
    return response.data.data;
  },

  // Remove a bookmark
  removeBookmark: async (adId: string): Promise<void> => {
    await apiClient.delete(`/ads/${adId}/bookmark`);
  },

  // Get current user's bookmarks
  getMyBookmarks: async (page: number = 1, limit: number = 20): Promise<BookmarksPaginatedResponse> => {
    const response = await apiClient.get<{ success: boolean; data: BookmarksPaginatedResponse }>(
      `/users/me/bookmarks?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get user's bookmarks (public profile)
  getUserBookmarks: async (userId: string, page: number = 1, limit: number = 20): Promise<BookmarksPaginatedResponse> => {
    const response = await apiClient.get<{ success: boolean; data: BookmarksPaginatedResponse }>(
      `/users/${userId}/bookmarks?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Check bookmark status
  getBookmarkStatus: async (adId: string): Promise<BookmarkStatus> => {
    const response = await apiClient.get<{ success: boolean; data: BookmarkStatus }>(
      `/ads/${adId}/bookmark/status`
    );
    return response.data.data;
  },

  // Toggle bookmark (helper method)
  toggleBookmark: async (adId: string, isBookmarked: boolean): Promise<Bookmark | null> => {
    if (isBookmarked) {
      await bookmarksService.removeBookmark(adId);
      return null;
    } else {
      return await bookmarksService.addBookmark(adId);
    }
  },
};

export default bookmarksService;
