import React, { useState } from 'react';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  buttonText?: string;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialValue = '',
  buttonText = 'Post Comment',
  isReply = false,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 2000) {
      setError('Comment must be less than 2000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content);
      setContent('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'G'}
          </div>
        </div>

        {/* Comment Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={isReply ? 3 : 4}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              content.length > 2000 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {content.length}/2000
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!content.trim() || content.length > 2000}
            >
              {buttonText}
            </Button>
            {onCancel && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
