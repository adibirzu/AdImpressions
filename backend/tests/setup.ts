import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test database setup and utilities
 */

let testDb: Database.Database;

/**
 * Initialize test database with schema
 */
export function setupTestDatabase(): Database.Database {
  const dbPath = path.join(__dirname, `../test-${uuidv4()}.sqlite`);
  testDb = new Database(dbPath);

  // Enable foreign keys
  testDb.pragma('foreign_keys = ON');

  // Create schema
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

  testDb.exec(schema);

  return testDb;
}

/**
 * Clean up test database
 */
export function teardownTestDatabase(): void {
  if (testDb) {
    testDb.close();
  }
}

/**
 * Clear all data from test database
 */
export function clearTestData(db: Database.Database): void {
  db.exec('DELETE FROM weekly_archive');
  db.exec('DELETE FROM analytics');
  db.exec('DELETE FROM votes');
  db.exec('DELETE FROM ads');
  db.exec('DELETE FROM users');
}

/**
 * Create a test user in the database
 */
export function createTestUser(
  db: Database.Database,
  data: {
    id?: string;
    username?: string;
    email?: string;
    password_hash?: string;
    role?: 'user' | 'admin';
  } = {}
): any {
  const id = data.id || uuidv4();
  const username = data.username || `testuser_${id.substring(0, 8)}`;
  const email = data.email || `${username}@test.com`;
  const password_hash = data.password_hash || '$2a$10$test.hash.placeholder';
  const role = data.role || 'user';
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, username, email, password_hash, role, now, now);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * Create a test ad in the database
 */
export function createTestAd(
  db: Database.Database,
  data: {
    id?: string;
    title?: string;
    description?: string;
    video_url?: string;
    video_platform?: 'youtube' | 'vimeo';
    video_id?: string;
    thumbnail_url?: string;
    brand?: string;
    category?: string;
    status?: 'active' | 'inactive' | 'archived';
  } = {}
): any {
  const id = data.id || uuidv4();
  const title = data.title || 'Test Ad';
  const video_url = data.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const video_platform = data.video_platform || 'youtube';
  const video_id = data.video_id || 'dQw4w9WgXcQ';
  const thumbnail_url = data.thumbnail_url || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO ads (
      id, title, description, video_url, video_platform, video_id,
      thumbnail_url, brand, category, status, total_votes, average_rating,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    title,
    data.description || null,
    video_url,
    video_platform,
    video_id,
    thumbnail_url,
    data.brand || null,
    data.category || null,
    data.status || 'active',
    0,
    0,
    now,
    now
  );

  return db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
}

/**
 * Create a test vote in the database
 */
export function createTestVote(
  db: Database.Database,
  data: {
    id?: string;
    ad_id: string;
    user_id?: string;
    rating: number;
    user_ip?: string;
    user_agent?: string;
  }
): any {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO votes (id, ad_id, user_id, rating, user_ip, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.ad_id,
    data.user_id || null,
    data.rating,
    data.user_ip || null,
    data.user_agent || null,
    now
  );

  return db.prepare('SELECT * FROM votes WHERE id = ?').get(id);
}

/**
 * Create a test analytics event in the database
 */
export function createTestAnalyticsEvent(
  db: Database.Database,
  data: {
    id?: string;
    ad_id: string;
    event_type: 'view' | 'vote' | 'share';
    user_id?: string;
    user_ip?: string;
    user_agent?: string;
    metadata?: any;
  }
): any {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  const metadata = data.metadata ? JSON.stringify(data.metadata) : null;

  const stmt = db.prepare(`
    INSERT INTO analytics (id, ad_id, event_type, user_id, user_ip, user_agent, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.ad_id,
    data.event_type,
    data.user_id || null,
    data.user_ip || null,
    data.user_agent || null,
    metadata,
    now
  );

  return db.prepare('SELECT * FROM analytics WHERE id = ?').get(id);
}

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(payload: any): string {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export default {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestData,
  createTestUser,
  createTestAd,
  createTestVote,
  createTestAnalyticsEvent,
  generateTestToken
};
