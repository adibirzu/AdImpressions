export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
}

export interface LoginResponse {
  user: UserPublic;
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserStats {
  totalVotes: number;
  totalBookmarks: number;
  totalComments: number;
  averageRating: number;
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

export interface PaginatedVotes {
  votes: VoteWithAd[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
