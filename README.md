# AdImpressions - Advertising Rating Platform

A crowd-sourced advertising rating platform where users vote on video advertisements. The platform provides valuable feedback to advertisers by allowing the community to rate and review ads, with weekly analytics and performance tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [API Documentation](#api-documentation)
- [Sample Video Ads](#sample-video-ads)
- [Testing](#testing)
- [Database](#database)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- **Video Ad Viewing**: Support for YouTube and Vimeo embedded video advertisements
- **User Voting System**: 5-star rating system for each advertisement
- **Real-time Analytics**: Live statistics and voting trends
- **User Authentication**: Secure registration and login system
- **Role-based Access**: Different permissions for users, advertisers, and administrators
- **Weekly Processing**: Automated weekly analysis and archival of low-rated ads
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS

### Analytics Features
- Ad performance tracking
- Weekly performance reports
- Trending ads dashboard
- Vote distribution analysis
- Category-based analytics
- Historical data archival

### Admin Features
- Ad management (CRUD operations)
- User management
- Analytics dashboard
- Weekly report generation
- Content moderation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │   Home   │  │ Ad View  │  │Analytics │  │ Admin Panel   │   │
│  │   Page   │  │  & Vote  │  │Dashboard │  │               │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
│                    Tailwind CSS + React Router                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                          REST API (JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend API (Express + TypeScript)              │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │    Ads     │  │  Voting   │  │  Users   │  │  Analytics  │  │
│  │   Module   │  │  Module   │  │  Module  │  │   Module    │  │
│  └────────────┘  └───────────┘  └──────────┘  └─────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Scheduler Module (node-cron)                │   │
│  │          Weekly Cleanup & Report Generation              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                   Authentication (JWT + bcrypt)                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (SQLite)                           │
│  ┌──────┐  ┌───────┐  ┌───────┐  ┌───────────┐  ┌───────────┐  │
│  │ ads  │  │ votes │  │ users │  │ analytics │  │  weekly   │  │
│  │      │  │       │  │       │  │           │  │  archive  │  │
│  └──────┘  └───────┘  └───────┘  └───────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (development), PostgreSQL ready (production)
- **Authentication**: JWT + bcryptjs
- **Scheduling**: node-cron
- **Testing**: Jest + Supertest

### Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Video Player**: react-player
- **Charts**: Recharts
- **Testing**: React Testing Library + Jest

### DevOps
- **Containerization**: Docker + Docker Compose
- **Process Management**: Concurrently
- **Build Tool**: TypeScript Compiler, React Scripts

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AdImpressions.git
cd AdImpressions
```

2. Install all dependencies:
```bash
npm run install:all
```

Or use the Makefile:
```bash
make install
```

### Environment Setup

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

2. Configure environment variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database
DATABASE_PATH=./data/adimpressions.db

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3001

# Scheduler (cron expression for weekly cleanup)
WEEKLY_CLEANUP_CRON=0 0 * * 0
```

3. Seed the database with sample data:
```bash
npm run seed
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm start
```

Or separately:
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Health Check: http://localhost:3000/health

### Production Mode

1. Build both applications:
```bash
npm run build
```

2. Start the backend:
```bash
cd backend
npm start
```

3. Serve the frontend build (use a static server like nginx or serve):
```bash
npx serve -s frontend/build -l 3001
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Ad Endpoints

#### List Ads
```http
GET /api/ads?page=1&limit=10&category=Technology&status=active
```

#### Get Single Ad
```http
GET /api/ads/:id
```

#### Create Ad (Advertiser/Admin only)
```http
POST /api/ads
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Amazing Product Ad",
  "description": "Check out our amazing product!",
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "brand": "Brand Name",
  "category": "Technology"
}
```

#### Update Ad
```http
PUT /api/ads/:id
Authorization: Bearer <token>
```

#### Delete Ad
```http
DELETE /api/ads/:id
Authorization: Bearer <token>
```

### Voting Endpoints

#### Cast Vote
```http
POST /api/ads/:id/vote
Content-Type: application/json

{
  "rating": 5
}
```

#### Get Vote Statistics
```http
GET /api/ads/:id/votes
```

### Analytics Endpoints

#### Get Ad Analytics
```http
GET /api/analytics/ad/:id
```

#### Get Weekly Report
```http
GET /api/analytics/weekly?week=48&year=2023
```

#### Get Trending Ads
```http
GET /api/analytics/trending?limit=10
```

## Sample Video Ads

The seeded database includes the following sample advertisements:

### Technology
1. **Apple - iPhone 15 Pro** - [YouTube](https://www.youtube.com/watch?v=xqyUdNxWazA)
   - Titanium. So strong. So light. So Pro.

2. **Amazon - Alexa Loses Her Voice** - [YouTube](https://www.youtube.com/watch?v=J6-8DQALGt4)
   - Super Bowl commercial featuring celebrity voices

3. **Google - Year in Search 2023** - [YouTube](https://www.youtube.com/watch?v=6BqhT0ESchY)
   - A look back at the most searched moments of the year

### Sports & Fashion
4. **Nike - You Can't Stop Us** - [YouTube](https://www.youtube.com/watch?v=WA4dDs0T7sM)
   - Unity and diversity in sports

### Automotive
5. **Tesla Model 3** - [YouTube](https://www.youtube.com/watch?v=zSjYra7cYqY)
   - The future of sustainable transportation

6. **BMW - The Hire** - [Vimeo](https://vimeo.com/59282790)
   - Iconic short film series

### Food & Beverages
7. **Coca-Cola - Open Happiness** - [YouTube](https://www.youtube.com/watch?v=IxXq28VljOs)
   - Classic commercial spreading joy

8. **McDonald's - Famous Orders** - [YouTube](https://www.youtube.com/watch?v=3lVCJ04WS5E)
   - Celebrities sharing their favorite orders

### Travel & Entertainment
9. **Airbnb - Made Possible by Hosts** - [Vimeo](https://vimeo.com/283721369)
   - Beautiful storytelling about unique stays

10. **Spotify - Wrapped 2023** - [YouTube](https://www.youtube.com/watch?v=moEqYloND34)
    - Your year in music

## Testing

### Run All Tests
```bash
npm test
```

### Backend Tests Only
```bash
npm run test:backend
```

### Frontend Tests Only
```bash
npm run test:frontend
```

### Watch Mode (Development)
```bash
# Backend
cd backend
npm run test:watch

# Frontend
cd frontend
npm test
```

## Database

### Schema Overview

The application uses SQLite in development with the following tables:

- **users**: User accounts and authentication
- **ads**: Advertisement listings
- **votes**: User votes and ratings
- **analytics**: Event tracking and metrics
- **weekly_archive**: Historical data for archived ads

### Database Operations

#### Initialize/Reset Database
```bash
npm run seed
```

#### Database Location
- Development: `backend/data/adimpressions.db`

#### Migrations
The database schema is initialized automatically on first run. Check `backend/src/config/database.ts` for schema definitions.

## Deployment

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Stop the application:
```bash
docker-compose down
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables for production
3. Set up a process manager (PM2, systemd)
4. Configure reverse proxy (nginx, Apache)
5. Set up SSL certificates (Let's Encrypt)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-random-secret>
DATABASE_PATH=/var/lib/adimpressions/production.db
CORS_ORIGIN=https://yourdomain.com
```

## Project Structure

```
AdImpressions/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── database/        # Database setup and seeding
│   │   ├── middleware/      # Express middleware
│   │   ├── modules/         # Feature modules
│   │   │   ├── ads/         # Ad management
│   │   │   ├── users/       # User management
│   │   │   ├── voting/      # Voting system
│   │   │   ├── analytics/   # Analytics & reporting
│   │   │   └── scheduler/   # Cron jobs
│   │   ├── utils/           # Utility functions
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # Docker orchestration
├── Makefile                 # Development commands
├── package.json             # Root package.json
├── ARCHITECTURE.md          # Architecture documentation
└── README.md               # This file
```

## Contributing

We welcome contributions to AdImpressions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Ensure all tests pass
3. Update the version number following [SemVer](https://semver.org/)
4. The PR will be merged once you have approval from maintainers

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and beginners
- Focus on constructive feedback
- Prioritize community well-being

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 AdImpressions

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

For questions and support:
- Open an issue on GitHub
- Check existing documentation
- Review the ARCHITECTURE.md file

## Acknowledgments

- React team for the amazing framework
- Express.js community
- All contributors and supporters

---

Built with ❤️ by the AdImpressions team
