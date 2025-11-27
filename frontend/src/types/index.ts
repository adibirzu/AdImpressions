// Advertisement types
export interface Ad {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  brand: string;
  industry?: string;
  duration?: number;
  uploaded_by: string;
  upload_date: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  net_votes: number;
  status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
}

// Vote types
export interface Vote {
  id: string;
  ad_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  net_votes: number;
  total_votes: number;
  upvote_percentage: number;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Analytics types
export interface DailyStats {
  date: string;
  total_votes: number;
  total_ads: number;
  active_users: number;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  top_ads: Ad[];
  total_votes: number;
  total_new_ads: number;
  most_active_users: User[];
}

export interface AdAnalytics {
  ad_id: string;
  views: number;
  votes_over_time: {
    date: string;
    upvotes: number;
    downvotes: number;
  }[];
  demographics?: {
    age_groups: Record<string, number>;
    regions: Record<string, number>;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Form types
export interface AdFormData {
  title: string;
  description: string;
  video_url: string;
  brand: string;
  industry?: string;
  tags?: string[];
}

// Filter and Sort types
export type SortBy = 'recent' | 'popular' | 'controversial' | 'trending';
export type FilterBy = 'all' | 'approved' | 'pending' | 'rejected';

export interface AdFilters {
  sort_by?: SortBy;
  filter_by?: FilterBy;
  industry?: string;
  brand?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// Comment types
export interface Comment {
  id: string;
  ad_id: string;
  user_id: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface CommentFormData {
  content: string;
  parent_id?: string;
}

export interface CommentsPaginatedResponse {
  comments: CommentWithReplies[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Bookmark types
export interface Bookmark {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
}

export interface BookmarkedAd extends Ad {
  bookmark_id: string;
  bookmarked_at: string;
}

export interface BookmarksPaginatedResponse {
  bookmarks: BookmarkedAd[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookmarkStatus {
  isBookmarked: boolean;
  bookmarkCount: number;
}

// Profile types
export interface UserProfile {
  id: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
}

export interface UserStats {
  totalVotes: number;
  totalBookmarks: number;
  totalComments: number;
  averageRating: number;
}

export interface UserProfileData {
  profile: UserProfile;
  stats: UserStats;
}

export interface VoteWithAd {
  id: string;
  ad_id: string;
  rating: number;
  created_at: string;
  ad_title: string;
  ad_thumbnail_url: string | null;
  ad_brand: string | null;
}

export interface VotingHistoryResponse {
  votes: VoteWithAd[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
