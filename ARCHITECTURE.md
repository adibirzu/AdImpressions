# AdImpressions Platform - Architecture Document

## Overview
A crowd-sourced advertising rating platform where users vote on advertisements.
Weekly low-rated ads are removed from mainstream view, providing valuable feedback to advertisers.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Home    │ │ Ad View  │ │ Analytics│ │ Admin Dashboard  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (Express)                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Ads Module │ │Vote Module │ │User Module │ │Analytics Mod│  │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Scheduler Module                         │ │
│  │              (Weekly Cleanup & Processing)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (SQLite)                           │
│  ┌──────┐ ┌───────┐ ┌───────┐ ┌───────────┐ ┌───────────────┐  │
│  │ ads  │ │ votes │ │ users │ │ analytics │ │ weekly_archive│  │
│  └──────┘ └───────┘ └───────┘ └───────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Modules

### 1. Ads Module (`/src/modules/ads`)
- CRUD operations for advertisements
- Support for YouTube and Vimeo embeds
- Ad categorization and tagging
- Status management (active, archived, removed)

### 2. Voting Module (`/src/modules/voting`)
- Upvote/Downvote functionality
- Vote aggregation and scoring
- Anti-fraud measures (rate limiting, unique votes)

### 3. Users Module (`/src/modules/users`)
- User registration and authentication
- Role management (user, advertiser, admin)
- Session management

### 4. Analytics Module (`/src/modules/analytics`)
- Real-time voting statistics
- Weekly performance reports
- Trend analysis for advertisers

### 5. Scheduler Module (`/src/modules/scheduler`)
- Weekly job to process votes
- Archive low-rated ads
- Generate weekly reports

## Database Schema

### ads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR | Ad title |
| description | TEXT | Ad description |
| video_url | VARCHAR | YouTube/Vimeo URL |
| video_type | ENUM | 'youtube' or 'vimeo' |
| advertiser_id | UUID | Foreign key to users |
| category | VARCHAR | Ad category |
| status | ENUM | active, archived, removed |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

### votes
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | Foreign key to ads |
| user_id | UUID | Foreign key to users |
| vote_type | ENUM | 'up' or 'down' |
| created_at | TIMESTAMP | Vote time |

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | User email |
| password_hash | VARCHAR | Hashed password |
| username | VARCHAR | Display name |
| role | ENUM | user, advertiser, admin |
| created_at | TIMESTAMP | Registration time |

### analytics
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | Foreign key to ads |
| week_number | INT | Week of year |
| year | INT | Year |
| upvotes | INT | Total upvotes |
| downvotes | INT | Total downvotes |
| score | FLOAT | Calculated score |

### weekly_archive
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | Foreign key to ads |
| week_number | INT | Week archived |
| year | INT | Year archived |
| final_score | FLOAT | Score when archived |
| reason | VARCHAR | Reason for archival |

## API Endpoints

### Ads
- `GET /api/ads` - List active ads (paginated)
- `GET /api/ads/:id` - Get single ad
- `POST /api/ads` - Create ad (advertiser only)
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

### Voting
- `POST /api/ads/:id/vote` - Cast vote
- `GET /api/ads/:id/votes` - Get vote stats

### Users
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Analytics
- `GET /api/analytics/ad/:id` - Ad analytics
- `GET /api/analytics/weekly` - Weekly report
- `GET /api/analytics/trending` - Trending ads

## Implementation Phases

### Phase 1: Foundation
- Project setup (Node.js, TypeScript, React)
- Database schema and migrations
- Basic project structure

### Phase 2: Core Backend
- Ads module implementation
- User authentication
- Voting system

### Phase 3: Frontend
- Home page with ad feed
- Ad viewing and voting UI
- User authentication UI

### Phase 4: Advanced Features
- Analytics dashboard
- Weekly scheduler
- Admin panel

### Phase 5: Testing
- Unit tests for all modules
- Integration tests
- E2E tests

## Technology Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production)
- **Testing**: Jest, React Testing Library
- **Scheduling**: node-cron
