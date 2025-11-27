export enum ReportReason {
  INAPPROPRIATE = 'inappropriate',
  MISLEADING = 'misleading',
  SPAM = 'spam',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface Report {
  id: string;
  ad_id: string;
  user_id: string | null;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReportDTO {
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportDTO {
  status: ReportStatus;
}

export interface ReportFilters {
  status?: ReportStatus;
  adId?: string;
  userId?: string;
  reason?: ReportReason;
}

export interface ReportWithAdInfo extends Report {
  ad_title?: string;
  ad_brand?: string;
  reporter_username?: string;
}
