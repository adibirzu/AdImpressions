import { db } from '../../config/database';
import {
  Comment,
  CommentWithReplies,
  CreateCommentDto,
  UpdateCommentDto,
  CommentsPaginatedResponse
} from './comments.types';
import { generateId } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';
import adsService from '../ads/ads.service';

export class CommentsService {
  /**
   * Create a new comment
   */
  createComment(data: CreateCommentDto, userId?: string): Comment {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    if (data.content.length > 2000) {
      throw new AppError('Comment content must be less than 2000 characters', 400);
    }

    // Check if ad exists
    const ad = adsService.getAdById(data.ad_id);
    if (!ad) {
      throw new AppError('Ad not found', 404);
    }

    if (ad.status !== 'active') {
      throw new AppError('Cannot comment on inactive ads', 400);
    }

    // If parent_id is provided, check if parent comment exists
    if (data.parent_id) {
      const parentComment = this.getCommentById(data.parent_id);
      if (!parentComment) {
        throw new AppError('Parent comment not found', 404);
      }

      // Ensure parent comment belongs to the same ad
      if (parentComment.ad_id !== data.ad_id) {
        throw new AppError('Parent comment does not belong to this ad', 400);
      }

      // Ensure parent is not already a reply (only 1 level deep)
      if (parentComment.parent_id !== null) {
        throw new AppError('Cannot reply to a reply. Only one level of nesting is allowed', 400);
      }
    }

    // Create the comment
    const id = generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO comments (id, ad_id, user_id, content, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.ad_id,
      userId || null,
      data.content.trim(),
      data.parent_id || null,
      now,
      now
    );

    const comment = this.getCommentById(id);
    if (!comment) {
      throw new AppError('Failed to create comment', 500);
    }

    return comment;
  }

  /**
   * Get a comment by ID
   */
  getCommentById(id: string): Comment | null {
    const stmt = db.prepare(`
      SELECT c.*, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    const comment = stmt.get(id) as Comment | undefined;
    return comment || null;
  }

  /**
   * Get comments for an ad with pagination and nested replies
   */
  getCommentsByAdId(
    adId: string,
    page: number = 1,
    limit: number = 20
  ): CommentsPaginatedResponse {
    const offset = (page - 1) * limit;

    // Get total count of parent comments (not replies)
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM comments
      WHERE ad_id = ? AND parent_id IS NULL
    `);
    const { count: total } = countStmt.get(adId) as { count: number };

    // Get parent comments with pagination
    const parentStmt = db.prepare(`
      SELECT c.*, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.ad_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const parentComments = parentStmt.all(adId, limit, offset) as Comment[];

    // Get all replies for these parent comments
    const commentsWithReplies: CommentWithReplies[] = parentComments.map(parent => {
      const repliesStmt = db.prepare(`
        SELECT c.*, u.username
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
      `);
      const replies = repliesStmt.all(parent.id) as Comment[];

      return {
        ...parent,
        replies
      };
    });

    return {
      comments: commentsWithReplies,
      total,
      page,
      limit,
      hasMore: offset + limit < total
    };
  }

  /**
   * Update a comment
   */
  updateComment(commentId: string, userId: string, data: UpdateCommentDto): Comment {
    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    if (data.content.length > 2000) {
      throw new AppError('Comment content must be less than 2000 characters', 400);
    }

    // Get existing comment
    const comment = this.getCommentById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check ownership
    if (comment.user_id !== userId) {
      throw new AppError('You can only edit your own comments', 403);
    }

    // Update the comment
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE comments
      SET content = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(data.content.trim(), now, commentId);

    const updatedComment = this.getCommentById(commentId);
    if (!updatedComment) {
      throw new AppError('Failed to update comment', 500);
    }

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string, userId: string, isAdmin: boolean = false): void {
    const comment = this.getCommentById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check ownership or admin privileges
    if (!isAdmin && comment.user_id !== userId) {
      throw new AppError('You can only delete your own comments', 403);
    }

    // Delete the comment and all its replies (CASCADE should handle this)
    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run(commentId);

    // Also delete replies if they exist (in case CASCADE is not set up)
    const deleteRepliesStmt = db.prepare('DELETE FROM comments WHERE parent_id = ?');
    deleteRepliesStmt.run(commentId);
  }

  /**
   * Get comment count for an ad
   */
  getCommentCount(adId: string): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM comments
      WHERE ad_id = ?
    `);
    const { count } = stmt.get(adId) as { count: number };
    return count;
  }

  /**
   * Get recent comments (for activity feed or moderation)
   */
  getRecentComments(limit: number = 20): Comment[] {
    const stmt = db.prepare(`
      SELECT c.*, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as Comment[];
  }

  /**
   * Get comments by user
   */
  getUserComments(userId: string): Comment[] {
    const stmt = db.prepare(`
      SELECT c.*, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `);
    return stmt.all(userId) as Comment[];
  }
}

export default new CommentsService();
