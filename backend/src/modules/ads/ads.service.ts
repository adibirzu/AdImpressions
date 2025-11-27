import { db } from '../../config/database';
import { Ad, CreateAdDTO, UpdateAdDTO, AdFilters } from './ads.types';
import { generateId } from '../../utils/helpers';
import { parseVideoUrl } from '../../utils/videoParser';
import { AppError } from '../../middleware/errorHandler';

export class AdsService {
  /**
   * Get all ads with optional filtering
   */
  getAllAds(filters?: AdFilters): Ad[] {
    let query = 'SELECT * FROM ads WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters?.search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Ad[];
  }

  /**
   * Get a single ad by ID
   */
  getAdById(id: string): Ad | null {
    const stmt = db.prepare('SELECT * FROM ads WHERE id = ?');
    const ad = stmt.get(id) as Ad | undefined;
    return ad || null;
  }

  /**
   * Create a new ad
   */
  createAd(data: CreateAdDTO): Ad {
    const videoInfo = parseVideoUrl(data.video_url);

    if (!videoInfo) {
      throw new AppError('Invalid video URL. Only YouTube and Vimeo URLs are supported.', 400);
    }

    const id = generateId();
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
      data.title,
      data.description || null,
      data.video_url,
      videoInfo.platform,
      videoInfo.videoId,
      videoInfo.thumbnailUrl,
      data.brand || null,
      data.category || null,
      'active',
      0,
      0,
      now,
      now
    );

    const ad = this.getAdById(id);
    if (!ad) {
      throw new AppError('Failed to create ad', 500);
    }

    return ad;
  }

  /**
   * Update an existing ad
   */
  updateAd(id: string, data: UpdateAdDTO): Ad {
    const existingAd = this.getAdById(id);
    if (!existingAd) {
      throw new AppError('Ad not found', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }

    if (data.video_url !== undefined) {
      const videoInfo = parseVideoUrl(data.video_url);
      if (!videoInfo) {
        throw new AppError('Invalid video URL', 400);
      }

      updates.push('video_url = ?', 'video_platform = ?', 'video_id = ?', 'thumbnail_url = ?');
      params.push(data.video_url, videoInfo.platform, videoInfo.videoId, videoInfo.thumbnailUrl);
    }

    if (data.brand !== undefined) {
      updates.push('brand = ?');
      params.push(data.brand);
    }

    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) {
      return existingAd;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `UPDATE ads SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    const updatedAd = this.getAdById(id);
    if (!updatedAd) {
      throw new AppError('Failed to update ad', 500);
    }

    return updatedAd;
  }

  /**
   * Delete an ad
   */
  deleteAd(id: string): void {
    const ad = this.getAdById(id);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }

    const stmt = db.prepare('DELETE FROM ads WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Update ad rating statistics
   */
  updateAdRating(adId: string, newRating: number): void {
    const stmt = db.prepare(`
      UPDATE ads
      SET total_votes = total_votes + 1,
          average_rating = (
            SELECT ROUND(AVG(rating) * 100) / 100
            FROM votes
            WHERE ad_id = ?
          ),
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(adId, new Date().toISOString(), adId);
  }

  /**
   * Get top-rated ads
   */
  getTopRatedAds(limit: number = 10): Ad[] {
    const stmt = db.prepare(`
      SELECT * FROM ads
      WHERE status = 'active' AND total_votes > 0
      ORDER BY average_rating DESC, total_votes DESC
      LIMIT ?
    `);

    return stmt.all(limit) as Ad[];
  }

  /**
   * Get trending ads (most voted in last 7 days)
   */
  getTrendingAds(limit: number = 10): Ad[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stmt = db.prepare(`
      SELECT a.*, COUNT(v.id) as recent_votes
      FROM ads a
      LEFT JOIN votes v ON a.id = v.ad_id AND v.created_at > ?
      WHERE a.status = 'active'
      GROUP BY a.id
      ORDER BY recent_votes DESC, a.average_rating DESC
      LIMIT ?
    `);

    return stmt.all(sevenDaysAgo.toISOString(), limit) as Ad[];
  }

  /**
   * Get ads by category
   */
  getAdsByCategory(category: string): Ad[] {
    const stmt = db.prepare(`
      SELECT * FROM ads
      WHERE category = ? AND status = 'active'
      ORDER BY average_rating DESC, created_at DESC
    `);

    return stmt.all(category) as Ad[];
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    const stmt = db.prepare(`
      SELECT DISTINCT category
      FROM ads
      WHERE category IS NOT NULL AND status = 'active'
      ORDER BY category
    `);

    const results = stmt.all() as { category: string }[];
    return results.map(r => r.category);
  }
}

export default new AdsService();
