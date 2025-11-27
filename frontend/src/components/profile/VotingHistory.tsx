import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoteWithAd } from '../../types';
import profileService from '../../services/profileService';
import Card from '../common/Card';
import Loading from '../common/Loading';
import Button from '../common/Button';

interface VotingHistoryProps {
  userId: string;
}

const VotingHistory: React.FC<VotingHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState<VoteWithAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVotes();
  }, [userId, page]);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const response = await profileService.getUserVotes(userId, page, 20);
      setVotes(response.votes);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load voting history');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && votes.length === 0) {
    return <Loading text="Loading voting history..." />;
  }

  if (error) {
    return (
      <Card padding="lg">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  if (votes.length === 0) {
    return (
      <Card padding="lg">
        <p className="text-gray-400 text-center">No votes yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <Card
          key={vote.id}
          variant="clickable"
          padding="md"
          onClick={() => navigate(`/ads/${vote.ad_id}`)}
        >
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-32 h-20 bg-dark-700 rounded overflow-hidden">
              {vote.ad_thumbnail_url ? (
                <img
                  src={vote.ad_thumbnail_url}
                  alt={vote.ad_title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=Ad';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* Vote Info */}
            <div className="flex-grow min-w-0">
              <h3 className="text-white font-semibold mb-1 truncate">
                {vote.ad_title}
              </h3>
              {vote.ad_brand && (
                <p className="text-primary-500 text-sm mb-2">{vote.ad_brand}</p>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${getRatingColor(vote.rating)}`}>
                  {getRatingStars(vote.rating)}
                </span>
                <span className="text-gray-400 text-sm">
                  {formatDate(vote.created_at)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-gray-400">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default VotingHistory;
