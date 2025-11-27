import { useState, useEffect } from 'react';
import { Vote, VoteStats } from '../types';
import votingService from '../services/votingService';
import { useAuth } from './useAuth';

export const useVoting = (adId: string) => {
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchUserVote = async () => {
    if (!isAuthenticated) {
      setUserVote(null);
      return;
    }

    try {
      const vote = await votingService.getUserVote(adId);
      setUserVote(vote);
    } catch (err: any) {
      console.error('Failed to fetch user vote:', err);
    }
  };

  const fetchVoteStats = async () => {
    try {
      const stats = await votingService.getAdVoteStats(adId);
      setVoteStats(stats);
    } catch (err: any) {
      console.error('Failed to fetch vote stats:', err);
    }
  };

  useEffect(() => {
    if (adId) {
      fetchUserVote();
      fetchVoteStats();
    }
  }, [adId, isAuthenticated]);

  const vote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to vote');
    }

    setLoading(true);
    setError(null);

    try {
      if (userVote) {
        if (userVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          await votingService.removeVote(userVote.id);
          setUserVote(null);
        } else {
          // Update vote if clicking different button
          const updatedVote = await votingService.updateVote(userVote.id, voteType);
          setUserVote(updatedVote);
        }
      } else {
        // Create new vote
        const newVote = await votingService.vote(adId, voteType);
        setUserVote(newVote);
      }

      // Refresh stats
      await fetchVoteStats();
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upvote = () => vote('upvote');
  const downvote = () => vote('downvote');

  return {
    userVote,
    voteStats,
    loading,
    error,
    upvote,
    downvote,
    refetch: () => {
      fetchUserVote();
      fetchVoteStats();
    },
  };
};

export default useVoting;
