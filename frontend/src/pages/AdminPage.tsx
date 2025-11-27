import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAds } from '../hooks/useAds';
import adsService from '../services/adsService';
import AdForm from '../components/ads/AdForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { AdFormData } from '../types';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAdForm, setShowAdForm] = useState(false);

  const { ads, loading, error, refetch } = useAds({ filter_by: 'pending' });

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleApprove = async (adId: string) => {
    try {
      await adsService.approveAd(adId);
      refetch();
    } catch (err) {
      console.error('Failed to approve ad:', err);
    }
  };

  const handleReject = async (adId: string) => {
    try {
      await adsService.rejectAd(adId);
      refetch();
    } catch (err) {
      console.error('Failed to reject ad:', err);
    }
  };

  const handleCreateAd = async (data: AdFormData) => {
    try {
      await adsService.createAd(data);
      setShowAdForm(false);
      refetch();
    } catch (err) {
      throw err;
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage ads and platform content</p>
          </div>
          <Button variant="primary" onClick={() => setShowAdForm(!showAdForm)}>
            {showAdForm ? 'Cancel' : 'Add New Ad'}
          </Button>
        </div>

        {showAdForm && (
          <div className="mb-8">
            <Card padding="lg">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Ad</h2>
              <AdForm onSubmit={handleCreateAd} submitLabel="Create Ad" />
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pending Ads</h2>

          {loading && <Loading text="Loading pending ads..." />}

          {error && (
            <Card padding="lg">
              <div className="text-red-500">{error}</div>
            </Card>
          )}

          {!loading && !error && ads.length === 0 && (
            <Card padding="lg">
              <div className="text-center text-gray-400">No pending ads to review</div>
            </Card>
          )}

          {!loading && !error && ads.length > 0 && (
            <div className="space-y-4">
              {ads.map((ad) => (
                <Card key={ad.id} padding="lg">
                  <div className="flex items-start gap-6">
                    <img
                      src={ad.thumbnail_url || 'https://via.placeholder.com/200x120'}
                      alt={ad.title}
                      className="w-48 h-28 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{ad.title}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-primary-500 font-semibold">{ad.brand}</span>
                        {ad.industry && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">{ad.industry}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-400 mb-4 line-clamp-2">{ad.description}</p>
                      <div className="text-sm text-gray-500">
                        Uploaded by {ad.uploaded_by} on{' '}
                        {new Date(ad.upload_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/ads/${ad.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApprove(ad.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(ad.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
