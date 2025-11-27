# AdImpressions Platform - Features Roadmap

## Executive Summary
This document outlines missing features and enhancement opportunities for the AdImpressions advertising rating platform. Features are categorized by functional area and prioritized based on business value, user impact, and technical complexity.

---

## Current Platform Status

### Implemented Features
- **Core Functionality**
  - User authentication and role management (user/admin)
  - Ad CRUD operations with YouTube/Vimeo support
  - Rating system (1-5 stars) with vote tracking
  - Basic analytics (views, votes, shares)
  - Admin approval workflow
  - Weekly archiving system
  - Search and filtering
  - Pagination

- **Frontend**
  - Home page with ad feed
  - Individual ad view page
  - Analytics dashboard
  - Admin dashboard
  - Responsive design (basic)

- **Backend**
  - RESTful API
  - SQLite database with proper indexing
  - Anti-fraud measures (IP tracking, unique votes)
  - Event tracking system
  - Scheduled jobs (weekly cleanup)

---

## Missing Features by Category

## 1. CORE ENGAGEMENT FEATURES

### 1.1 Comment System
**Priority: HIGH**

**Business Value:** Provides valuable qualitative feedback for advertisers and increases user engagement

**Current Gap:**
- No comment/feedback mechanism exists
- Users can only vote, not explain their reasoning
- No discussion or community engagement

**Implementation Requirements:**

#### Backend
```typescript
// Database Schema Addition
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_comment_id TEXT,  -- For nested replies
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_ad_id ON comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
```

**Module Structure:**
- `/backend/src/modules/comments/`
  - `comments.types.ts` - Comment, CreateCommentDTO, UpdateCommentDTO
  - `comments.service.ts` - CRUD operations, threading logic
  - `comments.controller.ts` - HTTP handlers
  - `comments.routes.ts` - API endpoints

**API Endpoints:**
- `POST /api/ads/:adId/comments` - Create comment
- `GET /api/ads/:adId/comments` - Get comments (with pagination & threading)
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment (soft delete)
- `POST /api/comments/:id/vote` - Vote on comment
- `GET /api/users/:userId/comments` - Get user's comments

**Frontend:**
- Create `CommentSection.tsx` component
- Create `Comment.tsx` component with nested replies
- Create `CommentForm.tsx` for posting/editing
- Add comment moderation in AdminPage
- Add "Report Comment" functionality

**Features:**
- Nested threading (2-3 levels deep)
- Vote on comments
- Edit/delete own comments
- Mention users with @username
- Sort by: newest, oldest, most upvoted
- Character limit (500-1000 chars)
- Rich text formatting (bold, italic, links)

**Estimated Effort:** 2-3 weeks

---

### 1.2 Social Sharing Functionality
**Priority: HIGH**

**Business Value:** Increases platform visibility, drives user acquisition, and provides free marketing

**Current Gap:**
- Analytics tracks 'share' events but no sharing mechanism exists
- No social media integration
- No shareable links with preview metadata

**Implementation Requirements:**

#### Backend
```typescript
// Add to ads.service.ts
generateShareableLink(adId: string): ShareableLink {
  return {
    url: `${BASE_URL}/ads/${adId}`,
    title: ad.title,
    description: ad.description,
    image: ad.thumbnail_url,
    hashtags: ad.category ? [ad.category] : []
  };
}

// Track share events
trackShare(adId: string, platform: string, userId?: string): void {
  analyticsService.trackEvent({
    ad_id: adId,
    event_type: 'share',
    metadata: { platform }
  }, userId);
}
```

**Add Open Graph meta tags:**
- Create middleware to dynamically inject OG tags for ad pages
- Add to `/backend/src/middleware/ogTags.ts`

**Frontend:**
- Create `ShareButton.tsx` component
- Integrate with Web Share API (mobile)
- Add dedicated share buttons for:
  - Facebook
  - Twitter/X
  - LinkedIn
  - WhatsApp
  - Email
  - Copy link
- Add share count display
- Create shareable preview cards

**Database Schema Addition:**
```sql
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  user_id TEXT,
  platform TEXT NOT NULL,
  user_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**API Endpoints:**
- `GET /api/ads/:id/share-data` - Get sharing metadata
- `POST /api/ads/:id/share` - Track share event
- `GET /api/ads/:id/share-count` - Get share statistics

**Estimated Effort:** 1-2 weeks

---

### 1.3 Notification System
**Priority: HIGH**

**Business Value:** Keeps advertisers engaged, provides real-time feedback, improves retention

**Current Gap:**
- No notification system exists
- Advertisers unaware of votes/comments on their ads
- No email notifications

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('vote', 'comment', 'reply', 'ad_approved', 'ad_rejected', 'milestone', 'weekly_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  related_ad_id TEXT,
  related_user_id TEXT,
  is_read BOOLEAN DEFAULT 0,
  is_emailed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  email_on_vote BOOLEAN DEFAULT 1,
  email_on_comment BOOLEAN DEFAULT 1,
  email_on_reply BOOLEAN DEFAULT 1,
  email_on_milestone BOOLEAN DEFAULT 1,
  email_weekly_report BOOLEAN DEFAULT 1,
  push_on_vote BOOLEAN DEFAULT 1,
  push_on_comment BOOLEAN DEFAULT 1,
  push_on_reply BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Module Structure:**
- `/backend/src/modules/notifications/`
  - `notifications.types.ts`
  - `notifications.service.ts`
  - `notifications.controller.ts`
  - `notifications.routes.ts`
  - `email/` - Email templates
    - `templates/vote-notification.html`
    - `templates/comment-notification.html`
    - `templates/weekly-report.html`

**Integration Points:**
- Trigger notifications on:
  - New vote on user's ad
  - New comment on user's ad
  - Reply to user's comment
  - Ad approval/rejection
  - Milestone reached (100 votes, 1000 views, etc.)
  - Weekly performance report

**API Endpoints:**
- `GET /api/notifications` - Get user notifications (paginated)
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

**Frontend:**
- Add notification bell icon in Header
- Create `NotificationDropdown.tsx` component
- Create `NotificationPreferences.tsx` page
- Real-time updates using polling or WebSockets
- Toast notifications for important events

**Email Integration:**
- Use nodemailer for email delivery
- Create HTML email templates
- Implement email queue system
- Add unsubscribe functionality

**Estimated Effort:** 3-4 weeks

---

### 1.4 Ad Reporting/Flagging System
**Priority: HIGH**

**Business Value:** Ensures platform quality, legal compliance, and user trust

**Current Gap:**
- No way to report inappropriate content
- No automated content filtering
- Relies solely on manual admin review

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  ad_id TEXT,
  comment_id TEXT,
  reporter_user_id TEXT,
  reason TEXT NOT NULL CHECK(reason IN (
    'inappropriate_content',
    'misleading',
    'spam',
    'copyright',
    'offensive',
    'low_quality',
    'other'
  )),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewer_id TEXT,
  resolution_note TEXT,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS automated_flags (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  confidence_score REAL,
  metadata TEXT,
  auto_resolved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);
```

**Module Structure:**
- `/backend/src/modules/moderation/`
  - `reports.service.ts`
  - `reports.controller.ts`
  - `reports.routes.ts`
  - `auto-moderation.service.ts`

**API Endpoints:**
- `POST /api/reports` - Create report
- `GET /api/reports` - Get all reports (admin)
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id/review` - Update report status
- `GET /api/ads/:id/reports` - Get reports for ad

**Frontend:**
- Add "Report" button on ads and comments
- Create `ReportModal.tsx` component
- Create moderation queue in AdminPage
- Add report statistics dashboard
- Show report count for flagged content

**Auto-Moderation Features:**
- Content scanning for prohibited keywords
- Duplicate content detection
- Spam pattern detection
- Rate limiting on ad submissions
- Automatic quarantine for highly reported content

**Estimated Effort:** 2-3 weeks

---

### 1.5 User Profile Pages
**Priority: MEDIUM**

**Business Value:** Increases user engagement, builds community, provides transparency

**Current Gap:**
- No user profiles exist
- No voting history visible
- No user statistics or achievements

**Implementation Requirements:**

#### Database Schema Additions
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN location TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN twitter_handle TEXT;
ALTER TABLE users ADD COLUMN linkedin_url TEXT;

CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  total_votes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_ads_uploaded INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  last_active DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_following (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(follower_id, following_id)
);
```

**API Endpoints:**
- `GET /api/users/:id/profile` - Get user profile
- `PUT /api/users/:id/profile` - Update profile
- `GET /api/users/:id/votes` - Get voting history
- `GET /api/users/:id/comments` - Get comment history
- `GET /api/users/:id/ads` - Get uploaded ads
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/achievements` - Get achievements
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

**Frontend:**
- Create `ProfilePage.tsx`
- Create `EditProfilePage.tsx`
- Create `VotingHistory.tsx` component
- Create `AchievementBadge.tsx` component
- Create `UserCard.tsx` component
- Add profile links throughout the app

**Features:**
- Public profile page
- Voting history with filters
- Comment history
- Uploaded ads
- Statistics dashboard
- Achievements/badges system
- Follow/unfollow users
- Privacy settings

**Achievement Ideas:**
- First Vote
- 100 Votes Cast
- Popular Voter (votes on trending ads)
- Critic (detailed comments)
- Advertiser badges
- Early Adopter
- Community Helper

**Estimated Effort:** 3-4 weeks

---

## 2. ADVANCED ANALYTICS FEATURES

### 2.1 Demographics Tracking
**Priority: MEDIUM**

**Business Value:** Provides valuable insights for advertisers, enables targeted campaigns

**Current Gap:**
- No demographic data collection
- No audience segmentation
- Limited targeting capabilities

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS user_demographics (
  user_id TEXT PRIMARY KEY,
  age_range TEXT CHECK(age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  gender TEXT CHECK(gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  country TEXT,
  region TEXT,
  city TEXT,
  occupation TEXT,
  interests TEXT, -- JSON array
  consent_given BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ad_demographics (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  age_range TEXT,
  gender TEXT,
  country TEXT,
  vote_count INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);
```

**Features:**
- Optional demographic questionnaire
- Privacy-first approach (opt-in)
- Aggregate reporting only (no individual tracking)
- Geographic heat maps
- Age/gender breakdown charts
- Interest-based segmentation

**API Endpoints:**
- `POST /api/users/demographics` - Submit demographics
- `GET /api/analytics/ads/:id/demographics` - Get demographic breakdown
- `GET /api/analytics/demographics/trends` - Platform-wide trends

**Frontend:**
- Create optional demographics form
- Add demographic charts to analytics
- Create audience insights dashboard
- Privacy controls

**Compliance:**
- GDPR compliance
- CCPA compliance
- Clear privacy policy
- Data deletion requests
- Consent management

**Estimated Effort:** 3-4 weeks

---

### 2.2 Engagement Metrics (Watch Time & Completion Rate)
**Priority: HIGH**

**Business Value:** Critical metric for video ad effectiveness, industry standard

**Current Gap:**
- Only tracks views, not engagement
- No video player event tracking
- No completion rate metrics

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS video_engagement (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  watch_duration INTEGER DEFAULT 0, -- seconds
  total_duration INTEGER, -- video length
  completion_rate REAL DEFAULT 0, -- percentage
  play_count INTEGER DEFAULT 1,
  pause_count INTEGER DEFAULT 0,
  seek_count INTEGER DEFAULT 0,
  fullscreen_entered BOOLEAN DEFAULT 0,
  quality_changes INTEGER DEFAULT 0,
  dropped_off_at INTEGER, -- timestamp where user stopped
  user_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_engagement_ad_id ON video_engagement(ad_id);
CREATE INDEX IF NOT EXISTS idx_engagement_session ON video_engagement(session_id);
```

**Frontend Implementation:**
- Update `AdPlayer.tsx` component with event tracking
- Track events:
  - Video start
  - Pause/Resume
  - Seek/Skip
  - Completion milestones (25%, 50%, 75%, 100%)
  - Playback speed changes
  - Quality changes
  - Fullscreen toggle
  - Drop-off point

```typescript
// Example tracking in AdPlayer.tsx
const trackEngagement = (event: EngagementEvent) => {
  engagementService.track({
    ad_id: ad.id,
    session_id: sessionId,
    event_type: event.type,
    timestamp: event.timestamp,
    metadata: event.metadata
  });
};

// YouTube/Vimeo API integration
player.on('timeupdate', (data) => {
  updateWatchTime(data.currentTime);
  checkMilestones(data.currentTime);
});
```

**Analytics Features:**
- Average watch time
- Completion rate distribution
- Drop-off analysis (where users stop watching)
- Replay rate
- Engagement score calculation
- Heatmaps showing most watched segments

**API Endpoints:**
- `POST /api/engagement/track` - Track engagement event
- `GET /api/analytics/ads/:id/engagement` - Get engagement metrics
- `GET /api/analytics/ads/:id/dropoff` - Get drop-off analysis
- `GET /api/analytics/ads/:id/heatmap` - Get watch-time heatmap

**Estimated Effort:** 2-3 weeks

---

### 2.3 A/B Testing Support
**Priority: MEDIUM**

**Business Value:** Enables data-driven optimization for advertisers

**Current Gap:**
- No A/B testing capabilities
- No variant comparison
- No statistical significance testing

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS ab_tests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'running', 'paused', 'completed')),
  start_date DATETIME,
  end_date DATETIME,
  traffic_split INTEGER DEFAULT 50, -- percentage for variant A
  confidence_level REAL DEFAULT 0.95,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ab_test_variants (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  variant_name TEXT NOT NULL, -- 'control' or 'variant_a', 'variant_b'
  ad_id TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  votes INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  is_winner BOOLEAN DEFAULT 0,
  FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Features:**
- Create A/B tests with multiple variants
- Automatic traffic splitting
- Statistical significance calculation
- Automatic winner declaration
- Performance comparison dashboards
- Test both different ads and different versions of the same ad

**API Endpoints:**
- `POST /api/ab-tests` - Create A/B test
- `GET /api/ab-tests` - List tests
- `GET /api/ab-tests/:id` - Get test details
- `PUT /api/ab-tests/:id` - Update test
- `POST /api/ab-tests/:id/start` - Start test
- `POST /api/ab-tests/:id/stop` - Stop test
- `GET /api/ab-tests/:id/results` - Get results
- `GET /api/ab-tests/:id/assign` - Get variant assignment for user

**Frontend:**
- Create A/B test creation wizard
- Results dashboard with statistical charts
- Variant comparison view
- Test management interface

**Statistical Analysis:**
- Chi-square test for categorical data
- T-test for continuous metrics
- Confidence intervals
- P-value calculation
- Sample size recommendations

**Estimated Effort:** 4-5 weeks

---

### 2.4 Export Reports (CSV/PDF)
**Priority: MEDIUM**

**Business Value:** Professional reporting for advertisers, enables offline analysis

**Current Gap:**
- No export functionality
- Data locked in web interface
- No shareable reports

**Implementation Requirements:**

**Backend Dependencies:**
- Add `csv-writer` for CSV generation
- Add `pdfkit` or `puppeteer` for PDF generation
- Add `node-schedule` for scheduled reports

**Module Structure:**
- `/backend/src/modules/reports/`
  - `report-generator.service.ts`
  - `csv-exporter.ts`
  - `pdf-exporter.ts`
  - `templates/` - PDF templates

**Report Types:**
1. Ad Performance Report
   - Views, votes, ratings over time
   - Demographics breakdown
   - Engagement metrics
   - Comments summary

2. Campaign Report (multiple ads)
   - Aggregate metrics
   - Comparative analysis
   - ROI calculations

3. Platform Analytics Report (admin)
   - Overall platform stats
   - Top performing ads
   - User growth
   - Engagement trends

4. Weekly Summary Report
   - Automated email digest
   - Key highlights
   - Trending ads

**API Endpoints:**
- `GET /api/reports/ads/:id/export?format=csv|pdf` - Export ad report
- `GET /api/reports/campaign/:id/export?format=csv|pdf` - Export campaign
- `GET /api/reports/analytics/export?format=csv|pdf&start_date=X&end_date=Y`
- `POST /api/reports/schedule` - Schedule recurring reports

**Frontend:**
- Add export buttons to analytics pages
- Create report configuration modal
- Add scheduled report settings
- Download progress indicator

**CSV Export Fields:**
```csv
Date, Views, Votes, Average Rating, Comments, Shares, Watch Time, Completion Rate
2024-01-01, 1250, 89, 4.2, 23, 45, 1850, 0.68
```

**PDF Features:**
- Professional branded template
- Charts and graphs
- Executive summary
- Detailed metrics tables
- Comparative analysis
- Date range selection

**Estimated Effort:** 2-3 weeks

---

## 3. ADVERTISER FEATURES

### 3.1 Advertiser Dashboard
**Priority: HIGH**

**Business Value:** Essential for advertiser self-service, reduces support burden

**Current Gap:**
- No dedicated advertiser interface
- Advertisers use regular user interface
- No campaign overview

**Implementation Requirements:**

#### Update Database Schema
```sql
-- Add advertiser role to users table
ALTER TABLE users MODIFY role TEXT CHECK(role IN ('user', 'advertiser', 'admin'));

CREATE TABLE IF NOT EXISTS advertiser_profiles (
  user_id TEXT PRIMARY KEY,
  company_name TEXT,
  company_website TEXT,
  industry TEXT,
  company_size TEXT CHECK(company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  verified BOOLEAN DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  credits_balance INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  advertiser_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT CHECK(objective IN ('awareness', 'engagement', 'conversions')),
  budget REAL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'paused', 'completed')),
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (advertiser_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Link ads to campaigns
ALTER TABLE ads ADD COLUMN campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE ads ADD COLUMN advertiser_id TEXT REFERENCES users(id) ON DELETE CASCADE;
```

**Frontend Pages:**
- `AdvertiserDashboard.tsx` - Main dashboard
- `CampaignList.tsx` - All campaigns
- `CampaignDetail.tsx` - Single campaign view
- `AdPerformance.tsx` - Detailed ad analytics
- `AdvertiserSettings.tsx` - Profile settings

**Dashboard Features:**
- Overview metrics (total views, avg rating, total spend)
- Active campaigns list
- Recent activity feed
- Quick actions (create ad, create campaign)
- Performance trends chart
- Top performing ads
- Alerts and recommendations

**API Endpoints:**
- `GET /api/advertiser/dashboard` - Dashboard data
- `GET /api/advertiser/campaigns` - List campaigns
- `GET /api/advertiser/ads` - List all advertiser ads
- `GET /api/advertiser/analytics` - Aggregate analytics
- `PUT /api/advertiser/profile` - Update profile

**Estimated Effort:** 3-4 weeks

---

### 3.2 Campaign Management
**Priority: HIGH**

**Business Value:** Enables organized ad management, professional workflow

**Current Gap:**
- No campaign grouping
- Ads managed individually
- No budget tracking across multiple ads

**Implementation Requirements:**

**Features:**
- Create campaigns with multiple ads
- Set campaign objectives and KPIs
- Budget allocation across ads
- Campaign scheduling
- Performance comparison across ads in campaign
- Clone campaigns
- Campaign templates

**API Endpoints:**
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/ads` - Add ad to campaign
- `DELETE /api/campaigns/:id/ads/:adId` - Remove ad
- `GET /api/campaigns/:id/analytics` - Campaign analytics

**Frontend:**
- Campaign creation wizard
- Drag-and-drop ad assignment
- Campaign calendar view
- Performance comparison charts
- Budget tracking and alerts

**Estimated Effort:** 2-3 weeks

---

### 3.3 Budget/Credits System
**Priority: MEDIUM**

**Business Value:** Revenue generation, premium features, sustainable business model

**Current Gap:**
- No monetization
- No premium features
- Free unlimited ad posting

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_type TEXT CHECK(transaction_type IN ('purchase', 'spend', 'refund', 'bonus', 'expired')),
  amount INTEGER NOT NULL, -- can be negative for spending
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_ad_id TEXT,
  related_campaign_id TEXT,
  payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_ad_id) REFERENCES ads(id) ON DELETE SET NULL,
  FOREIGN KEY (related_campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly REAL NOT NULL,
  price_yearly REAL NOT NULL,
  credits_per_month INTEGER,
  max_active_ads INTEGER,
  max_campaigns INTEGER,
  analytics_retention_days INTEGER,
  priority_support BOOLEAN DEFAULT 0,
  custom_branding BOOLEAN DEFAULT 0,
  api_access BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_provider TEXT,
  provider_payment_id TEXT,
  status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Pricing Model:**
```typescript
const TIER_PRICING = {
  free: {
    price: 0,
    creditsPerMonth: 10,
    maxActiveAds: 3,
    maxCampaigns: 1,
    analyticsRetention: 30
  },
  basic: {
    price: 29,
    creditsPerMonth: 100,
    maxActiveAds: 20,
    maxCampaigns: 5,
    analyticsRetention: 90
  },
  pro: {
    price: 99,
    creditsPerMonth: 500,
    maxActiveAds: 100,
    maxCampaigns: 20,
    analyticsRetention: 365
  },
  enterprise: {
    price: 299,
    creditsPerMonth: 2000,
    maxActiveAds: -1, // unlimited
    maxCampaigns: -1,
    analyticsRetention: -1
  }
};

const CREDIT_COSTS = {
  ad_submission: 5,
  featured_placement: 20,
  premium_analytics: 10,
  a_b_test: 15,
  export_report: 2
};
```

**Payment Integration:**
- Stripe integration
- PayPal support
- Credit card processing
- Invoice generation
- Automatic subscription renewal
- Prorated upgrades/downgrades

**API Endpoints:**
- `GET /api/billing/balance` - Get credit balance
- `POST /api/billing/purchase` - Purchase credits
- `GET /api/billing/transactions` - Transaction history
- `POST /api/billing/subscribe` - Subscribe to tier
- `POST /api/billing/cancel` - Cancel subscription
- `GET /api/billing/invoices` - Get invoices

**Frontend:**
- Billing dashboard
- Credit balance indicator
- Purchase credits modal
- Subscription management
- Invoice download
- Usage analytics

**Estimated Effort:** 4-6 weeks

---

### 3.4 Performance Benchmarks
**Priority: MEDIUM**

**Business Value:** Provides context for advertiser performance, drives improvement

**Current Gap:**
- No industry benchmarks
- No comparative analysis
- Hard to assess performance

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS performance_benchmarks (
  id TEXT PRIMARY KEY,
  category TEXT,
  industry TEXT,
  metric_name TEXT NOT NULL,
  percentile_25 REAL,
  percentile_50 REAL,
  percentile_75 REAL,
  percentile_90 REAL,
  average REAL,
  sample_size INTEGER,
  period_start DATE,
  period_end DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- Industry-specific benchmarks
- Category benchmarks
- Percentile rankings
- Performance score calculation
- Benchmark comparison charts
- Trend analysis vs. benchmarks

**Metrics to Benchmark:**
- Average rating
- Completion rate
- Engagement score
- Vote-to-view ratio
- Comment rate
- Share rate

**API Endpoints:**
- `GET /api/benchmarks/industry/:industry` - Get industry benchmarks
- `GET /api/benchmarks/category/:category` - Get category benchmarks
- `GET /api/benchmarks/compare/:adId` - Compare ad to benchmarks

**Frontend:**
- Benchmark comparison charts
- Performance scoring dashboard
- Industry comparison tool
- Insights and recommendations

**Estimated Effort:** 2-3 weeks

---

## 4. USER EXPERIENCE ENHANCEMENTS

### 4.1 Dark/Light Theme Toggle
**Priority: LOW**

**Business Value:** User preference, accessibility, modern UX standard

**Current Gap:**
- Fixed dark theme only
- No theme preference saving

**Implementation Requirements:**

**Frontend Implementation:**
- Add theme context provider
- Update Tailwind config for theme switching
- Create theme toggle component
- Save preference to localStorage
- Respect system preference

```typescript
// ThemeContext.tsx
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {}
});

// Update tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
};
```

**Theme Classes:**
- Create light mode color palette
- Update all components with theme-aware classes
- Test contrast ratios for accessibility

**API Integration:**
- `PUT /api/users/preferences` - Save theme preference
- `GET /api/users/preferences` - Get theme preference

**Estimated Effort:** 1-2 weeks

---

### 4.2 Infinite Scroll
**Priority: MEDIUM**

**Business Value:** Improved user engagement, modern UX, higher content discovery

**Current Gap:**
- Pagination only
- Requires clicks to load more
- Interrupts browsing flow

**Implementation Requirements:**

**Frontend:**
- Implement Intersection Observer API
- Replace pagination with infinite scroll
- Add loading spinner at bottom
- Preserve scroll position on back navigation
- Add "scroll to top" button

```typescript
// useInfiniteScroll.ts
const useInfiniteScroll = (loadMore: () => void, hasMore: boolean) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore]);

  return loadingRef;
};
```

**Features:**
- Smooth infinite scroll
- Virtual scrolling for performance (if needed)
- "Load more" button as fallback
- Preserve scroll position
- Prefetch next page

**Update API:**
- Keep pagination endpoints
- Add cursor-based pagination support for better performance

**Estimated Effort:** 1 week

---

### 4.3 Bookmark/Save Ads
**Priority: MEDIUM**

**Business Value:** Increases user engagement, enables later review

**Current Gap:**
- No way to save favorite ads
- Can't create collections
- Hard to find ads again

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  collection_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES bookmark_collections(id) ON DELETE SET NULL,
  UNIQUE(user_id, ad_id)
);

CREATE TABLE IF NOT EXISTS bookmark_collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Features:**
- Bookmark individual ads
- Create collections/playlists
- Add notes to bookmarks
- Share collections
- Public/private collections
- Quick bookmark from ad card

**API Endpoints:**
- `POST /api/bookmarks` - Bookmark ad
- `DELETE /api/bookmarks/:id` - Remove bookmark
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks/collections` - Create collection
- `GET /api/bookmarks/collections/:id` - Get collection
- `PUT /api/bookmarks/collections/:id` - Update collection

**Frontend:**
- Bookmark button on ad cards
- Bookmarks page
- Collections management
- Drag-and-drop to organize

**Estimated Effort:** 2 weeks

---

### 4.4 User Preferences/Settings
**Priority: MEDIUM**

**Business Value:** Personalization, improved UX, user control

**Current Gap:**
- No settings page
- No customization options
- Fixed experience for all users

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  timezone TEXT,
  email_notifications BOOLEAN DEFAULT 1,
  push_notifications BOOLEAN DEFAULT 1,
  auto_play_videos BOOLEAN DEFAULT 1,
  show_nsfw_content BOOLEAN DEFAULT 0,
  default_sort TEXT DEFAULT 'recent',
  items_per_page INTEGER DEFAULT 12,
  accessibility_mode BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Settings Categories:**

1. **Account Settings**
   - Email, username, password
   - Profile information
   - Account deletion

2. **Privacy Settings**
   - Profile visibility
   - Voting history privacy
   - Demographics sharing
   - Data download

3. **Notification Settings**
   - Email preferences
   - Push notification preferences
   - Notification frequency

4. **Display Settings**
   - Theme (dark/light)
   - Language
   - Timezone
   - Font size

5. **Content Settings**
   - Auto-play videos
   - NSFW content filter
   - Default sort order
   - Items per page

6. **Accessibility Settings**
   - High contrast mode
   - Screen reader support
   - Keyboard shortcuts
   - Reduced motion

**API Endpoints:**
- `GET /api/users/settings` - Get all settings
- `PUT /api/users/settings` - Update settings
- `PUT /api/users/settings/:category` - Update category

**Frontend:**
- Create comprehensive settings page
- Tab-based organization
- Real-time preview
- Save indicators
- Reset to defaults

**Estimated Effort:** 2-3 weeks

---

### 4.5 Mobile Responsive Improvements
**Priority: HIGH**

**Business Value:** 60%+ of traffic is mobile, critical for accessibility

**Current Gap:**
- Basic responsive design
- Not optimized for touch
- Mobile navigation could be better

**Implementation Requirements:**

**Improvements Needed:**

1. **Mobile Navigation**
   - Bottom navigation bar
   - Hamburger menu optimization
   - Touch-friendly hit areas (min 44x44px)
   - Swipe gestures

2. **Touch Optimizations**
   - Larger tap targets
   - Swipe to vote
   - Pull to refresh
   - Gesture controls for video player

3. **Performance**
   - Lazy load images
   - Progressive loading
   - Reduce bundle size
   - Optimize animations

4. **Mobile-First Components**
   - Mobile-optimized video player
   - Better modal experiences
   - Simplified forms
   - Bottom sheets instead of dropdowns

5. **Progressive Web App (PWA)**
   - Installable app
   - Offline support
   - Push notifications
   - App-like experience

**Implementation:**
```typescript
// Add service worker
// public/service-worker.js
self.addEventListener('fetch', (event) => {
  // Cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Add manifest
// public/manifest.json
{
  "name": "AdImpressions",
  "short_name": "AdImpressions",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#111827",
  "icons": [...]
}
```

**Testing:**
- Test on iOS Safari
- Test on Android Chrome
- Test various screen sizes
- Test touch gestures
- Test in slow network conditions

**Estimated Effort:** 3-4 weeks

---

## 5. MODERATION & SAFETY

### 5.1 Content Moderation Queue
**Priority: HIGH**

**Business Value:** Platform safety, legal compliance, quality control

**Current Gap:**
- Basic admin approval only
- No comprehensive moderation tools
- No flagged content queue

**Implementation Requirements:**

**Features:**
- Centralized moderation dashboard
- Queue management (FIFO, priority-based)
- Bulk actions
- Moderation history
- Appeal system
- Moderator notes

#### Database Schema Additions
```sql
CREATE TABLE IF NOT EXISTS moderation_queue (
  id TEXT PRIMARY KEY,
  item_type TEXT CHECK(item_type IN ('ad', 'comment', 'user_profile')),
  item_id TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  reason TEXT,
  auto_flagged BOOLEAN DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_review', 'approved', 'rejected')),
  assigned_moderator_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (assigned_moderator_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id TEXT PRIMARY KEY,
  queue_item_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  action TEXT CHECK(action IN ('approve', 'reject', 'remove', 'ban', 'warn', 'request_changes')),
  reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_item_id) REFERENCES moderation_queue(id) ON DELETE CASCADE,
  FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS moderation_guidelines (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('low', 'medium', 'high')),
  action TEXT,
  examples TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Moderation Actions:**
- Approve content
- Reject content
- Remove content
- Ban user (temporary/permanent)
- Issue warning
- Request changes
- Add to watchlist

**API Endpoints:**
- `GET /api/moderation/queue` - Get moderation queue
- `GET /api/moderation/queue/:id` - Get item details
- `POST /api/moderation/queue/:id/action` - Take action
- `POST /api/moderation/queue/:id/assign` - Assign moderator
- `GET /api/moderation/history` - Moderation history
- `GET /api/moderation/stats` - Moderation statistics

**Frontend:**
- Moderation dashboard
- Item preview
- Quick action buttons
- Bulk selection
- Filters and search
- Moderator notes
- Guidelines reference

**Estimated Effort:** 3-4 weeks

---

### 5.2 Auto-Moderation Rules
**Priority: MEDIUM**

**Business Value:** Scales moderation, reduces manual work, faster response

**Current Gap:**
- No automated moderation
- All manual review
- Slow response to violations

**Implementation Requirements:**

**Rule Types:**

1. **Content Rules**
   - Prohibited keywords/phrases
   - Spam detection patterns
   - URL filtering
   - Language detection
   - Profanity filter

2. **Behavioral Rules**
   - Rate limiting (X ads per hour)
   - Duplicate content detection
   - Vote manipulation detection
   - Sock puppet detection

3. **Quality Rules**
   - Minimum video quality
   - Minimum description length
   - Required fields validation
   - Broken link detection

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS moderation_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT CHECK(rule_type IN ('content', 'behavior', 'quality')),
  target TEXT CHECK(target IN ('ad', 'comment', 'user')),
  condition TEXT NOT NULL, -- JSON rule definition
  action TEXT CHECK(action IN ('flag', 'auto_reject', 'quarantine', 'alert')),
  severity TEXT CHECK(severity IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rule_violations (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  confidence_score REAL,
  details TEXT,
  auto_actioned BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES moderation_rules(id) ON DELETE CASCADE
);
```

**Example Rules:**
```typescript
const MODERATION_RULES = {
  spam_keywords: {
    name: "Spam Keyword Detection",
    patterns: ["buy now", "click here", "limited time", "act now"],
    action: "flag",
    severity: "medium"
  },
  excessive_posting: {
    name: "Rate Limiting",
    limit: 5,
    window: "1 hour",
    action: "auto_reject",
    severity: "high"
  },
  duplicate_content: {
    name: "Duplicate Detection",
    similarity_threshold: 0.9,
    action: "flag",
    severity: "medium"
  },
  inappropriate_content: {
    name: "NSFW Detection",
    use_ml_model: true,
    confidence_threshold: 0.8,
    action: "quarantine",
    severity: "high"
  }
};
```

**Implementation:**
- Text analysis service
- ML model integration (optional)
- Pattern matching engine
- Duplicate detection algorithm
- Rate limiting service

**API Endpoints:**
- `GET /api/moderation/rules` - List rules
- `POST /api/moderation/rules` - Create rule
- `PUT /api/moderation/rules/:id` - Update rule
- `DELETE /api/moderation/rules/:id` - Delete rule
- `GET /api/moderation/violations` - Get violations

**Frontend:**
- Rule management interface
- Rule testing/simulation
- Violation dashboard
- False positive review

**Estimated Effort:** 3-4 weeks

---

### 5.3 User Reputation System
**Priority: LOW**

**Business Value:** Encourages quality contributions, reduces spam

**Current Gap:**
- No reputation tracking
- All users treated equally
- No incentive for quality

**Implementation Requirements:**

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id TEXT PRIMARY KEY,
  reputation_score INTEGER DEFAULT 100,
  trust_level TEXT DEFAULT 'new' CHECK(trust_level IN ('new', 'basic', 'member', 'trusted', 'veteran')),
  helpful_votes INTEGER DEFAULT 0,
  quality_score REAL DEFAULT 0,
  violations_count INTEGER DEFAULT 0,
  last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reputation_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  related_item_type TEXT,
  related_item_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Reputation Points:**
```typescript
const REPUTATION_POINTS = {
  // Positive actions
  ad_approved: 10,
  helpful_vote_received: 2,
  quality_comment: 5,
  verified_account: 25,
  consistent_voting: 1,
  first_ad: 5,

  // Negative actions
  ad_rejected: -5,
  comment_removed: -10,
  reported_spam: -15,
  vote_manipulation: -50,
  banned: -100
};

const TRUST_LEVELS = {
  new: { min: 0, max: 50, permissions: ['basic'] },
  basic: { min: 51, max: 100, permissions: ['basic', 'comment'] },
  member: { min: 101, max: 500, permissions: ['basic', 'comment', 'flag'] },
  trusted: { min: 501, max: 1000, permissions: ['basic', 'comment', 'flag', 'review'] },
  veteran: { min: 1001, max: Infinity, permissions: ['all'] }
};
```

**Features:**
- Reputation score display
- Trust level badges
- Reputation history
- Leaderboard
- Privileges based on reputation
- Reputation recovery path

**Reputation Calculation:**
- Quality of contributions
- Community votes on content
- Moderation record
- Account age
- Activity consistency
- Violation history

**Benefits by Trust Level:**
- New: Basic voting
- Basic: Commenting
- Member: Flag content
- Trusted: Priority support, beta features
- Veteran: Moderation queue access, community leadership

**API Endpoints:**
- `GET /api/reputation/:userId` - Get reputation
- `GET /api/reputation/leaderboard` - Get top users
- `GET /api/reputation/:userId/history` - Reputation history

**Frontend:**
- Reputation badge on profiles
- Reputation page with breakdown
- Leaderboard page
- Progress indicators

**Estimated Effort:** 2-3 weeks

---

## IMPLEMENTATION PRIORITY MATRIX

### Phase 1: Critical (Months 1-2)
**Focus: Core engagement and platform safety**

1. **Comment System** - 3 weeks
2. **Social Sharing** - 2 weeks
3. **Notification System** - 4 weeks
4. **Ad Reporting/Flagging** - 3 weeks
5. **Mobile Responsive Improvements** - 4 weeks
6. **Content Moderation Queue** - 4 weeks

**Total: ~20 weeks** (with parallel development: 8-10 weeks)

### Phase 2: Revenue & Advertiser Tools (Months 3-4)
**Focus: Monetization and advertiser value**

1. **Advertiser Dashboard** - 4 weeks
2. **Campaign Management** - 3 weeks
3. **Budget/Credits System** - 5 weeks
4. **Engagement Metrics** - 3 weeks
5. **Export Reports** - 3 weeks

**Total: ~18 weeks** (with parallel development: 6-8 weeks)

### Phase 3: Advanced Features (Months 5-6)
**Focus: Advanced analytics and optimization**

1. **User Profile Pages** - 4 weeks
2. **Demographics Tracking** - 4 weeks
3. **A/B Testing Support** - 5 weeks
4. **Performance Benchmarks** - 3 weeks
5. **Auto-Moderation Rules** - 4 weeks

**Total: ~20 weeks** (with parallel development: 8-10 weeks)

### Phase 4: Polish & Enhancement (Months 7-8)
**Focus: UX improvements and optional features**

1. **Bookmark/Save Ads** - 2 weeks
2. **User Preferences/Settings** - 3 weeks
3. **Infinite Scroll** - 1 week
4. **Dark/Light Theme Toggle** - 2 weeks
5. **User Reputation System** - 3 weeks

**Total: ~11 weeks** (with parallel development: 4-5 weeks)

---

## TECHNICAL CONSIDERATIONS

### Database Migration Strategy
- Use migration scripts for schema changes
- Maintain backwards compatibility
- Plan for data backups before major migrations
- Test migrations on staging environment
- Consider read replicas for scaling

### API Versioning
- Implement API versioning from the start
- Use `/api/v1/` pattern
- Maintain v1 while developing v2
- Provide migration guides

### Performance Optimization
- Implement Redis caching for frequently accessed data
- Use database query optimization
- Add CDN for static assets
- Implement lazy loading throughout
- Consider database sharding for scale

### Security Enhancements
- Implement rate limiting on all endpoints
- Add CSRF protection
- Sanitize all user inputs
- Implement Content Security Policy
- Regular security audits
- Add 2FA for accounts

### Testing Strategy
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load testing for scalability
- A/B test all major features

### Monitoring & Analytics
- Implement error tracking (Sentry)
- Add performance monitoring (New Relic)
- Set up custom analytics dashboard
- Monitor database performance
- Track API response times
- User behavior analytics

### Third-Party Integrations
- Payment: Stripe/PayPal
- Email: SendGrid/AWS SES
- Storage: AWS S3/Cloudinary
- Analytics: Mixpanel/Amplitude
- Video: YouTube/Vimeo APIs
- Moderation: Perspective API (Google)

---

## SUCCESS METRICS

### User Engagement Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration
- Comments per ad
- Votes per user per session
- Return visitor rate
- Feature adoption rate

### Advertiser Metrics
- Advertiser conversion rate (free to paid)
- Average revenue per advertiser
- Campaign completion rate
- Advertiser retention rate
- NPS for advertisers
- Time to first campaign

### Platform Health Metrics
- Moderation queue size
- False positive rate
- Average time to moderation
- Report resolution time
- Content quality score
- Platform uptime

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate
- Revenue per user
- API call volume

---

## RISKS AND MITIGATION

### Technical Risks
- **Risk:** Database scaling issues
  - **Mitigation:** Early implementation of caching, database indexing, read replicas

- **Risk:** Video embedding rate limits
  - **Mitigation:** Implement caching, upgrade to paid API tiers

- **Risk:** Security vulnerabilities
  - **Mitigation:** Regular security audits, penetration testing, bug bounty program

### Business Risks
- **Risk:** Low advertiser adoption
  - **Mitigation:** Free trial period, excellent onboarding, clear value proposition

- **Risk:** Content moderation costs
  - **Mitigation:** Heavy investment in auto-moderation, community moderation

- **Risk:** Competition
  - **Mitigation:** Focus on unique features, excellent UX, community building

### Legal Risks
- **Risk:** Copyright violations
  - **Mitigation:** DMCA compliance, automated detection, clear TOS

- **Risk:** Data privacy violations
  - **Mitigation:** GDPR/CCPA compliance, privacy-first design, regular audits

- **Risk:** User-generated content liability
  - **Mitigation:** Clear TOS, active moderation, safe harbor provisions

---

## CONCLUSION

This roadmap outlines a comprehensive evolution of the AdImpressions platform from a basic ad rating system to a full-featured advertising analytics and management platform. The phased approach ensures:

1. **Quick wins** with high-impact features in Phase 1
2. **Revenue generation** through Phase 2 monetization features
3. **Competitive advantage** with advanced analytics in Phase 3
4. **User satisfaction** through UX improvements in Phase 4

**Recommended Starting Point:** Begin with Phase 1 features, particularly:
- Comment System (highest engagement impact)
- Notification System (keeps users engaged)
- Mobile Improvements (affects majority of users)
- Content Moderation (essential for growth)

**Estimated Total Development Time:** 6-8 months with a team of 3-4 developers

**Next Steps:**
1. Review and prioritize based on business goals
2. Create detailed technical specifications for Phase 1 features
3. Set up project management and tracking
4. Begin development sprints
5. Establish metrics and monitoring
6. Plan user testing and feedback loops
