import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import profileService from '../services/profileService';
import { UserProfileData } from '../types';
import ProfileHeader from '../components/profile/ProfileHeader';
import VotingHistory from '../components/profile/VotingHistory';
import BookmarksList from '../components/profile/BookmarksList';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

type TabType = 'votes' | 'bookmarks';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('votes');

  // Determine if viewing own profile
  const isOwnProfile = !id || (isAuthenticated && user?.id === id);
  const userId = isOwnProfile ? user?.id : id;

  useEffect(() => {
    if (isOwnProfile && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await profileService.getUserProfile(userId);
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card padding="lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'Unable to load profile.'}</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
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

        {/* Profile Header */}
        <ProfileHeader
          profile={profileData.profile}
          stats={profileData.stats}
        />

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-dark-600 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('votes')}
                className={`pb-4 px-2 font-semibold transition-colors ${
                  activeTab === 'votes'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Voting History
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`pb-4 px-2 font-semibold transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Bookmarks
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'votes' && userId && (
              <VotingHistory userId={userId} />
            )}
            {activeTab === 'bookmarks' && userId && (
              <BookmarksList userId={userId} isCurrentUser={isOwnProfile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
