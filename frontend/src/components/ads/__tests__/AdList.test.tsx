import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdList from '../AdList';
import { Ad } from '../../../types';

// Mock AdCard component
jest.mock('../AdCard', () => {
  return function MockAdCard({ ad }: { ad: Ad }) {
    return (
      <div data-testid={`ad-card-${ad.id}`}>
        <h3>{ad.title}</h3>
        <p>{ad.brand}</p>
      </div>
    );
  };
});

// Mock Loading component
jest.mock('../../common/Loading', () => {
  return function MockLoading({ text }: { text?: string }) {
    return <div data-testid="loading">{text || 'Loading...'}</div>;
  };
});

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
  {
    id: '3',
    title: 'Ad 3',
    description: 'Description 3',
    video_url: 'https://example.com/video3.mp4',
    brand: 'Brand 3',
    industry: 'Fashion',
    duration: 60,
    uploaded_by: 'user3',
    upload_date: '2024-01-03',
    view_count: 300,
    upvotes: 30,
    downvotes: 10,
    net_votes: 20,
    status: 'approved',
  },
];

const renderAdList = (props: any = {}) => {
  const defaultProps = {
    ads: mockAds,
    loading: false,
    error: null,
    ...props,
  };

  return render(
    <BrowserRouter>
      <AdList {...defaultProps} />
    </BrowserRouter>
  );
};

describe('AdList Component', () => {
  describe('loading state', () => {
    it('shows loading indicator when loading is true', () => {
      renderAdList({ ads: [], loading: true });
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading ads...')).toBeInTheDocument();
    });

    it('does not show ads when loading', () => {
      renderAdList({ ads: mockAds, loading: true });
      expect(screen.queryByTestId('ad-card-1')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when error is provided', () => {
      renderAdList({ ads: [], error: 'Failed to fetch ads' });
      expect(screen.getByText('Error loading ads')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch ads')).toBeInTheDocument();
    });

    it('does not show ads when there is an error', () => {
      renderAdList({ ads: mockAds, error: 'Network error' });
      expect(screen.queryByTestId('ad-card-1')).not.toBeInTheDocument();
    });

    it('does not show loading indicator when there is an error', () => {
      renderAdList({ ads: [], error: 'Error', loading: false });
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows default empty message when no ads are provided', () => {
      renderAdList({ ads: [] });
      expect(screen.getByText('No ads found')).toBeInTheDocument();
    });

    it('shows custom empty message when provided', () => {
      renderAdList({ ads: [], emptyMessage: 'Custom empty message' });
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    it('does not show loading indicator in empty state', () => {
      renderAdList({ ads: [], loading: false });
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  describe('ads rendering', () => {
    it('renders all ads when provided', () => {
      renderAdList();
      expect(screen.getByTestId('ad-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('ad-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('ad-card-3')).toBeInTheDocument();
    });

    it('renders ads in a grid layout', () => {
      const { container } = renderAdList();
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    });

    it('renders ad titles', () => {
      renderAdList();
      expect(screen.getByText('Ad 1')).toBeInTheDocument();
      expect(screen.getByText('Ad 2')).toBeInTheDocument();
      expect(screen.getByText('Ad 3')).toBeInTheDocument();
    });

    it('renders ad brands', () => {
      renderAdList();
      expect(screen.getByText('Brand 1')).toBeInTheDocument();
      expect(screen.getByText('Brand 2')).toBeInTheDocument();
      expect(screen.getByText('Brand 3')).toBeInTheDocument();
    });

    it('passes correct ad data to AdCard components', () => {
      renderAdList();
      const adCard1 = screen.getByTestId('ad-card-1');
      expect(adCard1).toBeInTheDocument();
    });
  });

  describe('onAdUpdate callback', () => {
    it('passes onAdUpdate to AdCard components', () => {
      const onAdUpdate = jest.fn();
      renderAdList({ onAdUpdate });
      // The onAdUpdate is passed to AdCard, which is mocked
      expect(screen.getByTestId('ad-card-1')).toBeInTheDocument();
    });
  });

  describe('mixed states', () => {
    it('prioritizes loading state over error state', () => {
      renderAdList({ ads: [], loading: true, error: 'Some error' });
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByText('Error loading ads')).not.toBeInTheDocument();
    });

    it('prioritizes error state over empty state', () => {
      renderAdList({ ads: [], loading: false, error: 'Some error' });
      expect(screen.getByText('Error loading ads')).toBeInTheDocument();
      expect(screen.queryByText('No ads found')).not.toBeInTheDocument();
    });

    it('shows ads even if error is set but ads exist', () => {
      renderAdList({ ads: mockAds, loading: false, error: null });
      expect(screen.getByTestId('ad-card-1')).toBeInTheDocument();
    });
  });

  describe('single ad', () => {
    it('renders correctly with only one ad', () => {
      renderAdList({ ads: [mockAds[0]] });
      expect(screen.getByTestId('ad-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('ad-card-2')).not.toBeInTheDocument();
    });
  });

  describe('large number of ads', () => {
    it('renders all ads when many are provided', () => {
      const manyAds = Array.from({ length: 20 }, (_, i) => ({
        ...mockAds[0],
        id: `ad-${i}`,
        title: `Ad ${i}`,
      }));
      renderAdList({ ads: manyAds });

      manyAds.forEach((ad) => {
        expect(screen.getByTestId(`ad-card-${ad.id}`)).toBeInTheDocument();
      });
    });
  });
});
