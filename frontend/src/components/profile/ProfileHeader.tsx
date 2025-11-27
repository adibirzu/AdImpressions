import React from 'react';
import { UserProfile, UserStats } from '../../types';
import Card from '../common/Card';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStats;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, stats }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Card padding="lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
            {getInitials(profile.username)}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
            {profile.role === 'admin' && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                ADMIN
              </span>
            )}
          </div>

          <p className="text-gray-400 mb-4">
            Joined {formatDate(profile.created_at)}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalVotes}
              </div>
              <div className="text-sm text-gray-400">Votes</div>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalBookmarks}
              </div>
              <div className="text-sm text-gray-400">Bookmarks</div>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalComments}
              </div>
              <div className="text-sm text-gray-400">Comments</div>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-500 mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
