import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import adsRoutes from './modules/ads/ads.routes';
import votingRoutes from './modules/voting/voting.routes';
import usersRoutes from './modules/users/users.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import commentsRoutes from './modules/comments/comments.routes';
import bookmarksRoutes from './modules/bookmarks/bookmarks.routes';
import reportsRoutes from './modules/reports/reports.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(rateLimit());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/ads', adsRoutes);
app.use('/api/votes', votingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', bookmarksRoutes);
app.use('/api', reportsRoutes);

// Welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to AdImpressions API',
    version: '1.0.0',
    endpoints: {
      ads: '/api/ads',
      votes: '/api/votes',
      users: '/api/users',
      analytics: '/api/analytics',
      comments: '/api/comments',
      health: '/health'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
