import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import commentsService from '../../services/commentsService';
import { CommentWithReplies } from '../../types';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Card from '../common/Card';

interface CommentSectionProps {
  adId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ adId }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const limit = 20;

  // Load comments
  const loadComments = async (pageNum: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await commentsService.getCommentsByAdId(adId, pageNum, limit);

      if (append) {
        setComments((prev) => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
      }

      setHasMore(response.hasMore);
      setTotal(response.total);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [adId]);

  // Handle creating a new comment
  const handleCreateComment = async (content: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    await commentsService.createComment(adId, { content });
    // Reload comments to show the new one
    await loadComments(1);
  };

  // Handle replying to a comment
  const handleReply = async (parentId: string, content: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    await commentsService.createComment(adId, { content, parent_id: parentId });
    // Reload comments to show the new reply
    await loadComments(1);
  };

  // Handle editing a comment
  const handleEdit = async (commentId: string, content: string) => {
    await commentsService.updateComment(commentId, content);
    // Update the comment in the local state
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content,
            updated_at: new Date().toISOString(),
          };
        }
        // Check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, content, updated_at: new Date().toISOString() }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  // Handle deleting a comment
  const handleDelete = async (commentId: string) => {
    await commentsService.deleteComment(commentId);
    // Remove the comment from the local state
    setComments((prev) =>
      prev.filter((comment) => {
        // If it's the parent comment being deleted
        if (comment.id === commentId) {
          return false;
        }
        // If it's a reply being deleted
        if (comment.replies) {
          comment.replies = comment.replies.filter((reply) => reply.id !== commentId);
        }
        return true;
      })
    );
    setTotal((prev) => prev - 1);
  };

  // Load more comments
  const handleLoadMore = () => {
    loadComments(page + 1, true);
  };

  if (loading) {
    return (
      <Card padding="lg">
        <Loading text="Loading comments..." />
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Comments {total > 0 && <span className="text-gray-400">({total})</span>}
          </h2>
        </div>

        {/* Comment form */}
        {isAuthenticated ? (
          <CommentForm onSubmit={handleCreateComment} />
        ) : (
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 mb-3">You need to be logged in to comment</p>
            <Button onClick={() => navigate('/login')} size="sm">
              Log In
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={comment.replies}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  isLoading={loadingMore}
                >
                  Load More Comments
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CommentSection;
