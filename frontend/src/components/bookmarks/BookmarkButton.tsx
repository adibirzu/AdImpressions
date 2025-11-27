import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import bookmarksService from '../../services/bookmarksService';

interface BookmarkButtonProps {
  adId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onBookmarkChange?: () => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  adId,
  size = 'md',
  showCount = true,
  onBookmarkChange,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetchBookmarkStatus();
  }, [adId]);

  const fetchBookmarkStatus = async () => {
    try {
      const status = await bookmarksService.getBookmarkStatus(adId);
      setIsBookmarked(status.isBookmarked);
      setBookmarkCount(status.bookmarkCount);
    } catch (error) {
      console.error('Failed to fetch bookmark status:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    setLoading(true);
    setAnimating(true);

    try {
      await bookmarksService.toggleBookmark(adId, isBookmarked);

      // Update local state
      setIsBookmarked(!isBookmarked);
      setBookmarkCount(prev => isBookmarked ? prev - 1 : prev + 1);

      onBookmarkChange?.();
    } catch (error: any) {
      console.error('Failed to toggle bookmark:', error);
      // Revert on error
      await fetchBookmarkStatus();
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const sizes = {
    sm: {
      button: 'p-1',
      icon: 'w-4 h-4',
      text: 'text-xs',
    },
    md: {
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'text-sm',
    },
    lg: {
      button: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-base',
    },
  };

  const sizeClasses = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`${sizeClasses.button} rounded-lg transition-all duration-200 ${
          isBookmarked
            ? 'bg-primary-600 text-white'
            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-primary-500'
        } disabled:opacity-50 ${animating ? 'scale-110' : 'scale-100'}`}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <svg
          className={`${sizeClasses.icon} transition-transform duration-200`}
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>

      {showCount && bookmarkCount > 0 && (
        <span className={`${sizeClasses.text} text-gray-400 font-medium`}>
          {bookmarkCount}
        </span>
      )}
    </div>
  );
};

export default BookmarkButton;
