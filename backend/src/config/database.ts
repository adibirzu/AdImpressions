import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database
export function initializeDatabase() {
  console.log('Initializing database...');

  // Execute schema creation
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ads table
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      video_platform TEXT NOT NULL CHECK(video_platform IN ('youtube', 'vimeo')),
      video_id TEXT NOT NULL,
      thumbnail_url TEXT,
      brand TEXT,
      category TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
      total_votes INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Votes table
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      ad_id TEXT NOT NULL,
      user_id TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      user_ip TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Analytics table
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      ad_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('view', 'vote', 'share')),
      user_id TEXT,
      user_ip TEXT,
      user_agent TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Weekly archive table
    CREATE TABLE IF NOT EXISTS weekly_archive (
      id TEXT PRIMARY KEY,
      ad_id TEXT NOT NULL,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      total_votes INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 0,
      total_views INTEGER DEFAULT 0,
      total_shares INTEGER DEFAULT 0,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_votes_ad_id ON votes(ad_id);
    CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
    CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_ad_id ON analytics(ad_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
    CREATE INDEX IF NOT EXISTS idx_weekly_archive_ad_id ON weekly_archive(ad_id);
    CREATE INDEX IF NOT EXISTS idx_weekly_archive_week_start ON weekly_archive(week_start);
    CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
  `;

  db.exec(schema);
  console.log('Database initialized successfully');
}

export default db;
