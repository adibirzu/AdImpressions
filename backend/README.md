# AdImpressions Backend API

A powerful advertising rating platform backend built with TypeScript, Express, and SQLite.

## Features

- RESTful API for managing ads, votes, users, and analytics
- JWT-based authentication
- Rate limiting and security middleware
- Video URL parsing for YouTube and Vimeo
- Analytics tracking and weekly data archiving
- Scheduled jobs for data cleanup
- Comprehensive error handling
- TypeScript for type safety

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** SQLite with better-sqlite3
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Scheduling:** node-cron
- **Testing:** Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Database Setup

Initialize and seed the database:
```bash
npm run seed
```

This will create:
- Database schema
- 2 users (admin and regular user)
- 10 sample ads with real YouTube/Vimeo videos
- Sample votes and analytics data

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### Ads
- `GET /api/ads` - Get all ads (with filters)
- `GET /api/ads/:id` - Get ad by ID
- `GET /api/ads/top-rated` - Get top-rated ads
- `GET /api/ads/trending` - Get trending ads
- `GET /api/ads/categories` - Get all categories
- `POST /api/ads` - Create ad (admin only)
- `PUT /api/ads/:id` - Update ad (admin only)
- `DELETE /api/ads/:id` - Delete ad (admin only)

### Voting
- `POST /api/votes` - Create a vote
- `GET /api/votes/ad/:adId` - Get votes for an ad
- `GET /api/votes/ad/:adId/stats` - Get vote statistics
- `GET /api/votes/check/:adId` - Check if user has voted
- `GET /api/votes/user/me` - Get current user's votes
- `GET /api/votes/recent` - Get recent votes

### Analytics
- `POST /api/analytics/track` - Track analytics event
- `GET /api/analytics/ad/:adId` - Get ad analytics summary
- `GET /api/analytics/platform-stats` - Get platform statistics
- `GET /api/analytics/weekly-archives/:adId` - Get weekly archives

### Health Check
- `GET /health` - Server health check

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Users

After seeding, you can login with:

**Admin:**
- Email: `admin@adimpressions.com`
- Password: `admin123`

**User:**
- Email: `john@example.com`
- Password: `user123`

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts           # Database configuration
│   ├── modules/
│   │   ├── ads/                  # Ads module
│   │   ├── voting/               # Voting module
│   │   ├── users/                # Users module
│   │   ├── analytics/            # Analytics module
│   │   └── scheduler/            # Scheduled jobs
│   ├── middleware/
│   │   ├── auth.ts               # Authentication middleware
│   │   ├── errorHandler.ts      # Error handling
│   │   └── rateLimit.ts          # Rate limiting
│   ├── database/
│   │   ├── schema.ts             # Database schema
│   │   └── seed.ts               # Seed data
│   ├── utils/
│   │   ├── videoParser.ts        # Video URL parser
│   │   └── helpers.ts            # Helper functions
│   ├── app.ts                    # Express app setup
│   └── index.ts                  # Entry point
├── tests/                        # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Video URL Support

The platform supports YouTube and Vimeo video URLs in various formats:

**YouTube:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Vimeo:**
- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`

## Scheduled Jobs

The platform runs scheduled jobs for maintenance:

- **Weekly Cleanup:** Runs every Sunday at midnight to archive previous week's data

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Strict rate limiting for voting (10 requests per minute)
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Development

The project uses TypeScript for type safety. Key features:

- Strict type checking
- Interface-based architecture
- Async/await error handling
- Modular service-based design

## Error Handling

All errors are handled centrally and return consistent JSON responses:

```json
{
  "error": "Error message here"
}
```

HTTP status codes are used appropriately:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## License

ISC

## Support

For issues or questions, please contact the development team.
