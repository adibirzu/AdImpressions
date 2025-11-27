export interface Ad {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  video_platform: 'youtube' | 'vimeo';
  video_id: string;
  thumbnail_url?: string;
  brand?: string;
  category?: string;
  status: 'active' | 'inactive' | 'archived';
  total_votes: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAdDTO {
  title: string;
  description?: string;
  video_url: string;
  brand?: string;
  category?: string;
}

export interface UpdateAdDTO {
  title?: string;
  description?: string;
  video_url?: string;
  brand?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface AdFilters {
  status?: 'active' | 'inactive' | 'archived';
  category?: string;
  brand?: string;
  search?: string;
}

export interface AdWithStats extends Ad {
  viewCount?: number;
  shareCount?: number;
  recentRatings?: number[];
}
