import React, { useState } from 'react';
import { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CommentForm from './CommentForm';
import Button from '../common/Button';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  onReply,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const canEdit = isOwner;
  const canDelete = isOwner || user?.role === 'admin';

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
  };

  const handleReplySubmit = async (content: string) => {
    await onReply(comment.id, content);
    setIsReplying(false);
  };

  const handleEditSubmit = async (content: string) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
    setShowDeleteConfirm(false);
  };

  const renderComment = (commentData: Comment, isReply: boolean = false) => (
    <div className={`flex gap-3 ${isReply ? 'ml-11' : ''}`}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
          {commentData.username?.charAt(0).toUpperCase() || 'G'}
        </div>
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-dark-700 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white text-sm">
              {commentData.username || 'Guest'}
            </span>
            <span className="text-gray-500 text-xs">
              {formatTimeAgo(commentData.created_at)}
            </span>
            {commentData.created_at !== commentData.updated_at && (
              <span className="text-gray-500 text-xs italic">(edited)</span>
            )}
          </div>

          {isEditing && !isReply && commentData.id === comment.id ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
                initialValue={commentData.content}
                placeholder="Edit your comment..."
                buttonText="Update"
                isReply={true}
              />
            </div>
          ) : (
            <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
              {commentData.content}
            </p>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2 ml-4">
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
              >
                Reply
              </button>
            )}

            {canEdit && !isReply && commentData.id === comment.id && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
              >
                Edit
              </button>
            )}

            {canDelete && commentData.id === comment.id && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && commentData.id === comment.id && (
          <div className="mt-3 ml-4 p-3 bg-dark-800 rounded-lg border border-red-500/30">
            <p className="text-sm text-gray-300 mb-3">
              Are you sure you want to delete this comment?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reply form */}
        {isReplying && !isReply && (
          <div className="mt-3 ml-4">
            <CommentForm
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              placeholder="Write a reply..."
              buttonText="Reply"
              isReply={true}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main comment */}
      {renderComment(comment, false)}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map((reply) => (
            <div key={reply.id}>
              {renderComment(reply, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
