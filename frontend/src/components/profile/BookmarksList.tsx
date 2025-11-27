import React, { useState, useEffect } from 'react';
import { BookmarkedAd } from '../../types';
import bookmarksService from '../../services/bookmarksService';
import AdCard from '../ads/AdCard';
import Card from '../common/Card';
import Loading from '../common/Loading';
import Button from '../common/Button';

interface BookmarksListProps {
  userId: string;
  isCurrentUser?: boolean;
}

const BookmarksList: React.FC<BookmarksListProps> = ({ userId, isCurrentUser = false }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, [userId, page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = isCurrentUser
        ? await bookmarksService.getMyBookmarks(page, 20)
        : await bookmarksService.getUserBookmarks(userId, page, 20);

      setBookmarks(response.bookmarks);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkChange = () => {
    // Refresh the bookmarks list when a bookmark is removed
    fetchBookmarks();
  };

  if (loading && bookmarks.length === 0) {
    return <Loading text="Loading bookmarks..." />;
  }

  if (error) {
    return (
      <Card padding="lg">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card padding="lg">
        <p className="text-gray-400 text-center">
          {isCurrentUser ? "You haven't bookmarked any ads yet" : "No bookmarks yet"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((ad) => (
          <AdCard
            key={ad.bookmark_id}
            ad={{
              id: ad.id,
              title: ad.title,
              description: ad.description || '',
              video_url: ad.video_url,
              thumbnail_url: ad.thumbnail_url || undefined,
              brand: ad.brand || '',
              industry: ad.category || undefined,
              view_count: 0, // Not provided in BookmarkedAd
              upvotes: 0, // Not provided in BookmarkedAd
              downvotes: 0, // Not provided in BookmarkedAd
              net_votes: 0,
              uploaded_by: '',
              upload_date: ad.created_at,
              status: ad.status as any,
            }}
            onVoteChange={handleBookmarkChange}
          />
        ))}
      </div>

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

export default BookmarksList;
