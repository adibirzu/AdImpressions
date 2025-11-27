import { db } from '../../config/database';
import { Bookmark, BookmarkedAd, PaginatedBookmarks } from './bookmarks.types';
import { generateId } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';

export class BookmarksService {
  /**
   * Add a bookmark
   */
  addBookmark(userId: string, adId: string): Bookmark {
    // Check if ad exists
    const adStmt = db.prepare('SELECT id FROM ads WHERE id = ?');
    const ad = adStmt.get(adId);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }

    // Check if bookmark already exists
    const existingStmt = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND ad_id = ?');
    const existing = existingStmt.get(userId, adId);
    if (existing) {
      throw new AppError('Ad already bookmarked', 400);
    }

    // Create bookmark
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO bookmarks (id, user_id, ad_id, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, userId, adId, now);

    return {
      id,
      user_id: userId,
      ad_id: adId,
      created_at: now
    };
  }

  /**
   * Remove a bookmark
   */
  removeBookmark(userId: string, adId: string): void {
    const stmt = db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND ad_id = ?');
    const result = stmt.run(userId, adId);

    if (result.changes === 0) {
      throw new AppError('Bookmark not found', 404);
    }
  }

  /**
   * Get user's bookmarks with pagination
   */
  getUserBookmarks(userId: string, page: number = 1, limit: number = 20): PaginatedBookmarks {
    const offset = (page - 1) * limit;

    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?');
    const { count } = countStmt.get(userId) as { count: number };

    // Get bookmarked ads
    const stmt = db.prepare(`
      SELECT
        b.id as bookmark_id,
        b.created_at as bookmarked_at,
        a.*
      FROM bookmarks b
      JOIN ads a ON b.ad_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const bookmarks = stmt.all(userId, limit, offset) as BookmarkedAd[];

    return {
      bookmarks,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Check if user has bookmarked an ad
   */
  isBookmarked(userId: string, adId: string): boolean {
    const stmt = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND ad_id = ?');
    const result = stmt.get(userId, adId);
    return !!result;
  }

  /**
   * Get bookmark count for an ad
   */
  getBookmarkCount(adId: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE ad_id = ?');
    const { count } = stmt.get(adId) as { count: number };
    return count;
  }

  /**
   * Get total bookmarks count for a user
   */
  getUserBookmarkCount(userId: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?');
    const { count } = stmt.get(userId) as { count: number };
    return count;
  }

  /**
   * Get multiple bookmarks status for a user
   */
  getBookmarksStatus(userId: string, adIds: string[]): Record<string, boolean> {
    if (adIds.length === 0) {
      return {};
    }

    const placeholders = adIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT ad_id FROM bookmarks
      WHERE user_id = ? AND ad_id IN (${placeholders})
    `);

    const bookmarked = stmt.all(userId, ...adIds) as { ad_id: string }[];
    const result: Record<string, boolean> = {};

    adIds.forEach(adId => {
      result[adId] = bookmarked.some(b => b.ad_id === adId);
    });

    return result;
  }
}

export default new BookmarksService();
