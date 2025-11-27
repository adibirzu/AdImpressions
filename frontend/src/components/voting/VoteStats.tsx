import React from 'react';
import { VoteStats as VoteStatsType } from '../../types';
import Card from '../common/Card';

interface VoteStatsProps {
  stats: VoteStatsType;
  showPercentage?: boolean;
}

const VoteStats: React.FC<VoteStatsProps> = ({ stats, showPercentage = true }) => {
  const { upvotes, downvotes, net_votes, total_votes, upvote_percentage } = stats;

  return (
    <Card padding="md">
      <h3 className="text-white font-semibold mb-4">Vote Statistics</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-gray-300">Upvotes</span>
          </div>
          <span className="text-white font-semibold text-lg">{upvotes.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-gray-300">Downvotes</span>
          </div>
          <span className="text-white font-semibold text-lg">{downvotes.toLocaleString()}</span>
        </div>

        <div className="border-t border-dark-600 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Net Votes</span>
            <span
              className={`font-bold text-lg ${
                net_votes > 0
                  ? 'text-green-500'
                  : net_votes < 0
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              {net_votes > 0 ? '+' : ''}{net_votes.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Total Votes</span>
            <span className="text-white font-semibold">{total_votes.toLocaleString()}</span>
          </div>
        </div>

        {showPercentage && (
          <div className="border-t border-dark-600 pt-4">
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">Approval Rate</span>
                <span className="text-white font-semibold">{upvote_percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-500 h-full transition-all duration-300"
                  style={{ width: `${upvote_percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoteStats;
