export interface Vote {
  id: string;
  ad_id: string;
  user_id: string | null;
  rating: number;
  user_ip?: string;
  user_agent?: string;
  created_at: string;
}

export interface CreateVoteDTO {
  ad_id: string;
  rating: number;
}

export interface VoteStats {
  ad_id: string;
  total_votes: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface UserVoteHistory {
  votes: Vote[];
  total: number;
}
