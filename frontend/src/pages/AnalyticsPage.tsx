import React, { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import { DailyStats, WeeklyReport as WeeklyReportType } from '../types';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import WeeklyReport from '../components/analytics/WeeklyReport';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const AnalyticsPage: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportType | null>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [daily, weekly, platform] = await Promise.all([
        analyticsService.getDailyStats(),
        analyticsService.getWeeklyReport(),
        analyticsService.getPlatformStats(),
      ]);

      setDailyStats(daily);
      setWeeklyReport(weekly);
      setPlatformStats(platform);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card padding="lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Analytics</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track platform performance and user engagement</p>
        </div>

        {/* Platform Overview */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Ads</span>
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {platformStats.total_ads.toLocaleString()}
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Users</span>
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {platformStats.total_users.toLocaleString()}
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Votes</span>
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
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {platformStats.total_votes.toLocaleString()}
              </p>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Active Today</span>
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {platformStats.active_users_today.toLocaleString()}
              </p>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {dailyStats.length > 0 && (
            <>
              <AnalyticsChart
                title="Daily Votes"
                data={dailyStats}
                type="area"
                dataKeys={[
                  { key: 'total_votes', color: '#ef4444', name: 'Total Votes' },
                ]}
                xAxisKey="date"
              />

              <AnalyticsChart
                title="New Ads Per Day"
                data={dailyStats}
                type="bar"
                dataKeys={[
                  { key: 'total_ads', color: '#10b981', name: 'New Ads' },
                ]}
                xAxisKey="date"
              />

              <AnalyticsChart
                title="Active Users"
                data={dailyStats}
                type="line"
                dataKeys={[
                  { key: 'active_users', color: '#3b82f6', name: 'Active Users' },
                ]}
                xAxisKey="date"
              />
            </>
          )}
        </div>

        {/* Weekly Report */}
        {weeklyReport && <WeeklyReport report={weeklyReport} />}
      </div>
    </div>
  );
};

export default AnalyticsPage;
