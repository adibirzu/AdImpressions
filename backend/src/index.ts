import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './config/database';
import schedulerService from './modules/scheduler/scheduler.service';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize database
try {
  initializeDatabase();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Initialize scheduler
try {
  schedulerService.init();
  console.log('Scheduler initialized successfully');
} catch (error) {
  console.error('Failed to initialize scheduler:', error);
}

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`AdImpressions API Server`);
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  schedulerService.stopAll();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  schedulerService.stopAll();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default server;
