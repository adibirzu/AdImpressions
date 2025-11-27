import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAd } from '../hooks/useAds';
import AdPlayer from '../components/ads/AdPlayer';
import VoteButtons from '../components/voting/VoteButtons';
import VoteStats from '../components/voting/VoteStats';
import CommentSection from '../components/comments/CommentSection';
import BookmarkButton from '../components/bookmarks/BookmarkButton';
import ShareButtons from '../components/sharing/ShareButtons';
import ReportButton from '../components/reporting/ReportButton';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { useVoting } from '../hooks/useVoting';

const AdViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ad, loading, error, refetch } = useAd(id!);
  const { voteStats } = useVoting(id!);

  if (loading) {
    return <Loading fullScreen text="Loading ad..." />;
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card padding="lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ad Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The ad you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <svg
            className="w-5 h-5 mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <AdPlayer ad={ad} />

            {/* Ad Info */}
            <Card padding="lg">
              <h1 className="text-3xl font-bold text-white mb-4">{ad.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-primary-500 font-semibold text-lg">{ad.brand}</span>
                </div>
                {ad.industry && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{ad.industry}</span>
                  </>
                )}
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{ad.view_count.toLocaleString()} views</span>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <VoteButtons
                  adId={ad.id}
                  initialUpvotes={ad.upvotes}
                  initialDownvotes={ad.downvotes}
                  size="lg"
                  onVoteChange={refetch}
                />
                <BookmarkButton
                  adId={ad.id}
                  size="lg"
                  showCount={true}
                />
              </div>

              <div className="border-t border-dark-600 pt-6">
                <h2 className="text-white font-semibold text-lg mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {ad.description}
                </p>
              </div>

              {ad.tags && ad.tags.length > 0 && (
                <div className="border-t border-dark-600 pt-6 mt-6">
                  <h2 className="text-white font-semibold text-lg mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {ad.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-dark-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share and Report Section */}
              <div className="border-t border-dark-600 pt-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <ShareButtons
                    adId={ad.id}
                    adTitle={ad.title}
                    shareCount={0}
                  />
                  <ReportButton
                    adId={ad.id}
                    adTitle={ad.title}
                  />
                </div>
              </div>

              <div className="border-t border-dark-600 pt-6 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Uploaded by {ad.uploaded_by}</span>
                  <span>{formatDate(ad.upload_date)}</span>
                </div>
              </div>
            </Card>

            {/* Comments Section */}
            <CommentSection adId={ad.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vote Statistics */}
            {voteStats && <VoteStats stats={voteStats} />}

            {/* Ad Details */}
            <Card padding="lg">
              <h3 className="text-white font-semibold mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`font-semibold ${
                      ad.status === 'approved'
                        ? 'text-green-500'
                        : ad.status === 'pending'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                </div>
                {ad.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">
                      {Math.floor(ad.duration / 60)}:{(ad.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Views</span>
                  <span className="text-white">{ad.view_count.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdViewPage;
