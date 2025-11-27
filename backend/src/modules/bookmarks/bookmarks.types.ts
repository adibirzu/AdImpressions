export interface Bookmark {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
}

export interface CreateBookmarkDTO {
  ad_id: string;
}

export interface BookmarkedAd {
  bookmark_id: string;
  ad_id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_platform: string;
  video_id: string;
  thumbnail_url: string | null;
  brand: string | null;
  category: string | null;
  status: string;
  total_votes: number;
  average_rating: number;
  created_at: string;
  bookmarked_at: string;
}

export interface PaginatedBookmarks {
  bookmarks: BookmarkedAd[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
