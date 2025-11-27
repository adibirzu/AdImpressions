import React from 'react';
import { Ad } from '../../types';
import AdCard from './AdCard';
import Loading from '../common/Loading';

interface AdListProps {
  ads: Ad[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onAdUpdate?: () => void;
}

const AdList: React.FC<AdListProps> = ({
  ads,
  loading = false,
  error = null,
  emptyMessage = 'No ads found',
  onAdUpdate,
}) => {
  if (loading) {
    return <Loading text="Loading ads..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Error loading ads</div>
        <div className="text-gray-400">{error}</div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} onVoteChange={onAdUpdate} />
      ))}
    </div>
  );
};

export default AdList;
