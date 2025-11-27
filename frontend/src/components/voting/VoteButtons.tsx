import React from 'react';
import { useVoting } from '../../hooks/useVoting';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface VoteButtonsProps {
  adId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  size?: 'sm' | 'md' | 'lg';
  showCounts?: boolean;
  onVoteChange?: () => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  adId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  size = 'md',
  showCounts = true,
  onVoteChange,
}) => {
  const { userVote, voteStats, upvote, downvote, loading } = useVoting(adId);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (voteType === 'upvote') {
        await upvote();
      } else {
        await downvote();
      }
      onVoteChange?.();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const upvoteCount = voteStats?.upvotes ?? initialUpvotes;
  const downvoteCount = voteStats?.downvotes ?? initialDownvotes;
  const netVotes = upvoteCount - downvoteCount;

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
        onClick={(e) => {
          e.stopPropagation();
          handleVote('upvote');
        }}
        disabled={loading}
        className={`${sizeClasses.button} rounded-lg transition-all duration-200 ${
          userVote?.vote_type === 'upvote'
            ? 'bg-green-600 text-white'
            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-green-500'
        } disabled:opacity-50`}
        title="Upvote"
      >
        <svg
          className={sizeClasses.icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showCounts && (
        <span
          className={`${sizeClasses.text} font-semibold min-w-[2rem] text-center ${
            netVotes > 0
              ? 'text-green-500'
              : netVotes < 0
              ? 'text-red-500'
              : 'text-gray-400'
          }`}
        >
          {netVotes > 0 ? '+' : ''}{netVotes}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote('downvote');
        }}
        disabled={loading}
        className={`${sizeClasses.button} rounded-lg transition-all duration-200 ${
          userVote?.vote_type === 'downvote'
            ? 'bg-red-600 text-white'
            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-red-500'
        } disabled:opacity-50`}
        title="Downvote"
      >
        <svg
          className={sizeClasses.icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default VoteButtons;
