import { Request, Response } from 'express';
import bookmarksService from './bookmarks.service';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class BookmarksController {
  /**
   * POST /api/ads/:adId/bookmark
   * Add a bookmark
   */
  async addBookmark(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { adId } = req.params;
      const bookmark = bookmarksService.addBookmark(req.user.id, adId);

      res.status(201).json({
        success: true,
        message: 'Bookmark added successfully',
        data: bookmark
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/ads/:adId/bookmark
   * Remove a bookmark
   */
  async removeBookmark(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { adId } = req.params;
      bookmarksService.removeBookmark(req.user.id, adId);

      res.json({
        success: true,
        message: 'Bookmark removed successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/me/bookmarks
   * Get current user's bookmarks
   */
  async getMyBookmarks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = bookmarksService.getUserBookmarks(req.user.id, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/:adId/bookmark/status
   * Check if user has bookmarked an ad
   */
  async checkBookmarkStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      let isBookmarked = false;

      if (req.user) {
        isBookmarked = bookmarksService.isBookmarked(req.user.id, adId);
      }

      const bookmarkCount = bookmarksService.getBookmarkCount(adId);

      res.json({
        success: true,
        data: {
          isBookmarked,
          bookmarkCount
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/users/:userId/bookmarks
   * Get user's bookmarks (public profile)
   */
  async getUserBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = bookmarksService.getUserBookmarks(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new BookmarksController();
