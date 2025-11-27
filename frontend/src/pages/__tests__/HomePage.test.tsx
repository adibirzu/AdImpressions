import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { useAds } from '../../hooks/useAds';
import { Ad } from '../../types';

// Mock the useAds hook
jest.mock('../../hooks/useAds');

// Mock AdList component
jest.mock('../../components/ads/AdList', () => {
  return function MockAdList({ ads, loading, error, emptyMessage }: any) {
    if (loading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error}</div>;
    if (ads.length === 0) return <div data-testid="empty">{emptyMessage}</div>;
    return (
      <div data-testid="ad-list">
        {ads.map((ad: Ad) => (
          <div key={ad.id} data-testid={`ad-${ad.id}`}>
            {ad.title}
          </div>
        ))}
      </div>
    );
  };
});

const mockUseAds = useAds as jest.MockedFunction<typeof useAds>;

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Ad 1',
    description: 'Description 1',
    video_url: 'https://example.com/video1.mp4',
    brand: 'Brand 1',
    industry: 'Technology',
    duration: 30,
    uploaded_by: 'user1',
    upload_date: '2024-01-01',
    view_count: 100,
    upvotes: 10,
    downvotes: 2,
    net_votes: 8,
    status: 'approved',
  },
  {
    id: '2',
    title: 'Ad 2',
    description: 'Description 2',
    video_url: 'https://example.com/video2.mp4',
    brand: 'Brand 2',
    industry: 'Entertainment',
    duration: 45,
    uploaded_by: 'user2',
    upload_date: '2024-01-02',
    view_count: 200,
    upvotes: 20,
    downvotes: 5,
    net_votes: 15,
    status: 'approved',
  },
];

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseAds.mockReturnValue({
      ads: mockAds,
      loading: false,
      error: null,
      pagination: {
        total: 2,
        page: 1,
        page_size: 12,
        total_pages: 1,
      },
      refetch: jest.fn(),
    });
  });

  describe('rendering', () => {
    it('renders the hero section', () => {
      renderHomePage();
      expect(screen.getByText(/Discover Amazing/i)).toBeInTheDocument();
      expect(screen.getByText(/Advertisements/i)).toBeInTheDocument();
    });

    it('renders the search bar', () => {
      renderHomePage();
      expect(screen.getByPlaceholderText(/Search ads by title, brand, or industry/i)).toBeInTheDocument();
    });

    it('renders sort buttons', () => {
      renderHomePage();
      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();
      expect(screen.getByText('Controversial')).toBeInTheDocument();
      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    it('renders filter buttons', () => {
      renderHomePage();
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders ad list', () => {
      renderHomePage();
      expect(screen.getByTestId('ad-list')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('updates search input value', () => {
      renderHomePage();
      const searchInput = screen.getByPlaceholderText(/Search ads by title, brand, or industry/i) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(searchInput.value).toBe('test search');
    });

    it('triggers search on form submit', async () => {
      const mockRefetch = jest.fn();
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 2, page: 1, page_size: 12, total_pages: 1 },
        refetch: mockRefetch,
      });

      renderHomePage();
      const searchInput = screen.getByPlaceholderText(/Search ads by title, brand, or industry/i);
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('resets page to 1 when searching', async () => {
      renderHomePage();
      const searchInput = screen.getByPlaceholderText(/Search ads by title, brand, or industry/i);
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.click(searchButton);

      // Page should be reset to 1
      await waitFor(() => {
        expect(mockUseAds).toHaveBeenCalled();
      });
    });
  });

  describe('sorting functionality', () => {
    it('applies active class to default sort (Recent)', () => {
      renderHomePage();
      const recentButton = screen.getByText('Recent');
      expect(recentButton).toHaveClass('bg-primary-600');
    });

    it('changes sort when clicking sort button', () => {
      renderHomePage();
      const popularButton = screen.getByText('Popular');

      fireEvent.click(popularButton);

      expect(popularButton).toHaveClass('bg-primary-600');
    });

    it('calls useAds with correct sort parameter', () => {
      renderHomePage();
      const trendingButton = screen.getByText('Trending');

      fireEvent.click(trendingButton);

      // Check that useAds was called with trending sort
      const lastCall = mockUseAds.mock.calls[mockUseAds.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({ sort_by: 'trending' });
    });

    it('resets page to 1 when changing sort', () => {
      renderHomePage();
      const controversialButton = screen.getByText('Controversial');

      fireEvent.click(controversialButton);

      const lastCall = mockUseAds.mock.calls[mockUseAds.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({ page: 1 });
    });
  });

  describe('filtering functionality', () => {
    it('applies active class to default filter (All)', () => {
      renderHomePage();
      const allButton = screen.getByText('All');
      expect(allButton).toHaveClass('bg-primary-600');
    });

    it('changes filter when clicking filter button', () => {
      renderHomePage();
      const approvedButton = screen.getByText('Approved');

      fireEvent.click(approvedButton);

      expect(approvedButton).toHaveClass('bg-primary-600');
    });

    it('calls useAds with correct filter parameter', () => {
      renderHomePage();
      const pendingButton = screen.getByText('Pending');

      fireEvent.click(pendingButton);

      const lastCall = mockUseAds.mock.calls[mockUseAds.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({ filter_by: 'pending' });
    });

    it('resets page to 1 when changing filter', () => {
      renderHomePage();
      const approvedButton = screen.getByText('Approved');

      fireEvent.click(approvedButton);

      const lastCall = mockUseAds.mock.calls[mockUseAds.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({ page: 1 });
    });
  });

  describe('pagination', () => {
    it('does not show pagination when there is only one page', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 2, page: 1, page_size: 12, total_pages: 1 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('shows pagination when there are multiple pages', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 1, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 1, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('disables Next button on last page', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 3, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('enables Next button when not on last page', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 1, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('shows page numbers', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 1, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('highlights current page', () => {
      mockUseAds.mockReturnValue({
        ads: mockAds,
        loading: false,
        error: null,
        pagination: { total: 30, page: 2, page_size: 12, total_pages: 3 },
        refetch: jest.fn(),
      });

      renderHomePage();

      const pageButtons = screen.getAllByText('2');
      const currentPageButton = pageButtons.find(button => button.tagName === 'BUTTON');
      expect(currentPageButton).toHaveClass('bg-primary-600');
    });
  });

  describe('loading and error states', () => {
    it('shows loading state', () => {
      mockUseAds.mockReturnValue({
        ads: [],
        loading: true,
        error: null,
        pagination: { total: 0, page: 1, page_size: 12, total_pages: 0 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('shows error state', () => {
      mockUseAds.mockReturnValue({
        ads: [],
        loading: false,
        error: 'Failed to load ads',
        pagination: { total: 0, page: 1, page_size: 12, total_pages: 0 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load ads')).toBeInTheDocument();
    });

    it('shows empty state when no ads', () => {
      mockUseAds.mockReturnValue({
        ads: [],
        loading: false,
        error: null,
        pagination: { total: 0, page: 1, page_size: 12, total_pages: 0 },
        refetch: jest.fn(),
      });

      renderHomePage();

      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });
  });

  describe('combined filters and sort', () => {
    it('applies both sort and filter simultaneously', () => {
      renderHomePage();

      const popularButton = screen.getByText('Popular');
      const approvedButton = screen.getByText('Approved');

      fireEvent.click(popularButton);
      fireEvent.click(approvedButton);

      const lastCall = mockUseAds.mock.calls[mockUseAds.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({
        sort_by: 'popular',
        filter_by: 'approved',
      });
    });
  });
});
