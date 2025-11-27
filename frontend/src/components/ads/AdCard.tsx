import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ad } from '../../types';
import Card from '../common/Card';
import VoteButtons from '../voting/VoteButtons';
import BookmarkButton from '../bookmarks/BookmarkButton';

interface AdCardProps {
  ad: Ad;
  onVoteChange?: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onVoteChange }) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on vote buttons or bookmark button
    if ((e.target as HTMLElement).closest('.vote-buttons') ||
        (e.target as HTMLElement).closest('.bookmark-button')) {
      return;
    }
    navigate(`/ads/${ad.id}`);
  };

  const getThumbnail = () => {
    if (ad.thumbnail_url) {
      return ad.thumbnail_url;
    }

    // Extract YouTube thumbnail if it's a YouTube URL
    const youtubeMatch = ad.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }

    // Extract Vimeo thumbnail (would need API call in real implementation)
    const vimeoMatch = ad.video_url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }

    // Default placeholder
    return 'https://via.placeholder.com/640x360?text=Ad+Video';
  };

  return (
    <Card variant="clickable" padding="none" onClick={handleCardClick}>
      <div className="relative aspect-video bg-dark-700">
        <img
          src={getThumbnail()}
          alt={ad.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Ad+Video';
          }}
        />
        {ad.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {Math.floor(ad.duration / 60)}:{(ad.duration % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
          {ad.title}
        </h3>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-primary-500 text-sm font-medium">{ad.brand}</span>
          {ad.industry && (
            <>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">{ad.industry}</span>
            </>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {ad.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            {ad.view_count.toLocaleString()} views
          </div>

          <div className="flex items-center gap-3">
            <div className="bookmark-button">
              <BookmarkButton
                adId={ad.id}
                size="sm"
                showCount={false}
              />
            </div>

            <div className="vote-buttons">
              <VoteButtons
                adId={ad.id}
                initialUpvotes={ad.upvotes}
                initialDownvotes={ad.downvotes}
                size="sm"
                onVoteChange={onVoteChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdCard;
