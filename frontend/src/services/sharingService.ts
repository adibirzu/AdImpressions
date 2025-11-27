import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const sharingService = {
  /**
   * Track a share event for an ad
   */
  async trackShare(adId: string, platform: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/analytics`, {
        ad_id: adId,
        event_type: 'share',
        metadata: JSON.stringify({ platform })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
      // Don't throw error - tracking failures shouldn't break the share functionality
    }
  },

  /**
   * Get share count for an ad
   */
  async getShareCount(adId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/analytics/ads/${adId}/stats`);
      return response.data.data.shareCount || 0;
    } catch (error) {
      console.error('Failed to get share count:', error);
      return 0;
    }
  },

  /**
   * Get share statistics by platform for an ad
   */
  async getSharesByPlatform(adId: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${API_URL}/analytics/ads/${adId}/shares`);
      return response.data.data || {};
    } catch (error) {
      console.error('Failed to get shares by platform:', error);
      return {};
    }
  }
};
