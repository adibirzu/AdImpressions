import React from 'react';
import { WeeklyReport as WeeklyReportType } from '../../types';
import Card from '../common/Card';
import AdCard from '../ads/AdCard';

interface WeeklyReportProps {
  report: WeeklyReportType;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ report }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Weekly Report</h2>
          <p className="text-gray-400">
            {formatDate(report.week_start)} - {formatDate(report.week_end)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Votes</span>
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {report.total_votes.toLocaleString()}
            </p>
          </div>

          <div className="bg-dark-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">New Ads</span>
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {report.total_new_ads.toLocaleString()}
            </p>
          </div>

          <div className="bg-dark-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Users</span>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {report.most_active_users.length.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {report.top_ads.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Top Performing Ads This Week</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.top_ads.slice(0, 6).map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </div>
      )}

      {report.most_active_users.length > 0 && (
        <Card padding="lg">
          <h3 className="text-xl font-bold text-white mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {report.most_active_users.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-dark-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary-500 font-bold">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReport;
