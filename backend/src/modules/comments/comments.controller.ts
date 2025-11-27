import { Request, Response } from 'express';
import commentsService from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.types';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export class CommentsController {
  /**
   * POST /api/ads/:adId/comments
   * Create a new comment for an ad
   */
  async createComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const { content, parent_id } = req.body;

      if (!content) {
        throw new AppError('Comment content is required', 400);
      }

      const data: CreateCommentDto = {
        ad_id: adId,
        content,
        parent_id
      };

      const userId = req.user?.id;
      const comment = commentsService.createComment(data, userId);

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/:adId/comments
   * Get all comments for an ad with pagination
   */
  async getCommentsByAdId(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1) {
        throw new AppError('Page must be greater than 0', 400);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', 400);
      }

      const result = commentsService.getCommentsByAdId(adId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/comments/:id
   * Get a single comment by ID
   */
  async getCommentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comment = commentsService.getCommentById(id);

      if (!comment) {
        throw new AppError('Comment not found', 404);
      }

      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/comments/:id
   * Update a comment
   */
  async updateComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      if (!content) {
        throw new AppError('Comment content is required', 400);
      }

      const data: UpdateCommentDto = { content };
      const comment = commentsService.updateComment(id, req.user.id, data);

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/comments/:id
   * Delete a comment
   */
  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const isAdmin = req.user.role === 'admin';
      commentsService.deleteComment(id, req.user.id, isAdmin);

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/:adId/comments/count
   * Get comment count for an ad
   */
  async getCommentCount(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const count = commentsService.getCommentCount(adId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/comments/recent
   * Get recent comments (for activity feed)
   */
  async getRecentComments(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const comments = commentsService.getRecentComments(limit);

      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/comments/user/me
   * Get current user's comments
   */
  async getMyComments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const comments = commentsService.getUserComments(req.user.id);

      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new CommentsController();
