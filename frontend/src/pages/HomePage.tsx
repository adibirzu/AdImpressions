import React, { useState } from 'react';
import { useAds } from '../hooks/useAds';
import { SortBy, FilterBy } from '../types';
import AdList from '../components/ads/AdList';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { ads, loading, error, pagination, refetch } = useAds({
    sort_by: sortBy,
    filter_by: filterBy,
    search: search || undefined,
    page,
    page_size: 12,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover Amazing <span className="text-primary-500">Advertisements</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Rate, review, and explore the world's best advertising campaigns
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ads by title, brand, or industry..."
                className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit" variant="primary" size="lg">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-400 mr-2">Sort by:</span>
            {(['recent', 'popular', 'controversial', 'trending'] as SortBy[]).map((sort) => (
              <button
                key={sort}
                onClick={() => {
                  setSortBy(sort);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === sort
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-gray-400 mr-2">Filter:</span>
            {(['all', 'approved', 'pending'] as FilterBy[]).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setFilterBy(filter);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterBy === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Ads Grid */}
        <AdList
          ads={ads}
          loading={loading}
          error={error}
          emptyMessage="No ads found. Try adjusting your filters."
          onAdUpdate={refetch}
        />

        {/* Pagination */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {pagination.total_pages > 5 && (
                <>
                  <span className="text-gray-600">...</span>
                  <button
                    onClick={() => setPage(pagination.total_pages)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === pagination.total_pages
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                    }`}
                  >
                    {pagination.total_pages}
                  </button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
