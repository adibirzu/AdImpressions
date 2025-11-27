export interface AnalyticsEvent {
  id: string;
  ad_id: string;
  event_type: 'view' | 'vote' | 'share';
  user_id: string | null;
  user_ip?: string;
  user_agent?: string;
  metadata?: string;
  created_at: string;
}

export interface CreateAnalyticsEventDTO {
  ad_id: string;
  event_type: 'view' | 'vote' | 'share';
  metadata?: Record<string, any>;
}

export interface AnalyticsSummary {
  ad_id: string;
  total_views: number;
  total_votes: number;
  total_shares: number;
  unique_visitors?: number;
}

export interface DateRangeAnalytics {
  start_date: string;
  end_date: string;
  total_events: number;
  events_by_type: {
    view: number;
    vote: number;
    share: number;
  };
  top_ads: {
    ad_id: string;
    title: string;
    event_count: number;
  }[];
}

export interface WeeklyArchive {
  id: string;
  ad_id: string;
  week_start: string;
  week_end: string;
  total_votes: number;
  average_rating: number;
  total_views: number;
  total_shares: number;
  archived_at: string;
}
