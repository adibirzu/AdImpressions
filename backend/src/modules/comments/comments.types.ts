export interface Comment {
  id: string;
  ad_id: string;
  user_id: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  username?: string; // Joined from users table
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface CreateCommentDto {
  ad_id: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentsPaginatedResponse {
  comments: CommentWithReplies[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
