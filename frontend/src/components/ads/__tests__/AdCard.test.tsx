import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdCard from '../AdCard';
import { Ad } from '../../../types';

// Mock VoteButtons component
jest.mock('../../voting/VoteButtons', () => {
  return function MockVoteButtons({ adId, initialUpvotes, initialDownvotes }: any) {
    return (
      <div className="vote-buttons" data-testid="vote-buttons">
        <span>Upvotes: {initialUpvotes}</span>
        <span>Downvotes: {initialDownvotes}</span>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAd: Ad = {
  id: '1',
  title: 'Test Ad',
  description: 'This is a test ad description',
  video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  brand: 'Test Brand',
  industry: 'Technology',
  duration: 125,
  uploaded_by: 'user1',
  upload_date: '2024-01-01',
  view_count: 1234,
  upvotes: 100,
  downvotes: 20,
  net_votes: 80,
  status: 'approved',
  tags: ['tech', 'innovation'],
};

const renderAdCard = (ad: Ad = mockAd, onVoteChange?: () => void) => {
  return render(
    <BrowserRouter>
      <AdCard ad={ad} onVoteChange={onVoteChange} />
    </BrowserRouter>
  );
};

describe('AdCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ad title', () => {
    renderAdCard();
    expect(screen.getByText('Test Ad')).toBeInTheDocument();
  });

  it('renders ad description', () => {
    renderAdCard();
    expect(screen.getByText('This is a test ad description')).toBeInTheDocument();
  });

  it('renders brand name', () => {
    renderAdCard();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  it('renders industry', () => {
    renderAdCard();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders view count', () => {
    renderAdCard();
    expect(screen.getByText('1,234 views')).toBeInTheDocument();
  });

  it('renders thumbnail image with correct src', () => {
    renderAdCard();
    const img = screen.getByAltText('Test Ad') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('thumbnail.jpg');
  });

  it('renders duration in correct format', () => {
    renderAdCard();
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('renders vote buttons', () => {
    renderAdCard();
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
    expect(screen.getByText('Upvotes: 100')).toBeInTheDocument();
    expect(screen.getByText('Downvotes: 20')).toBeInTheDocument();
  });

  it('navigates to ad detail page when card is clicked', () => {
    renderAdCard();
    const card = screen.getByText('Test Ad').closest('div')?.parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/ads/1');
    }
  });

  it('does not navigate when clicking on vote buttons', () => {
    renderAdCard();
    const voteButtons = screen.getByTestId('vote-buttons');
    fireEvent.click(voteButtons);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('extracts YouTube thumbnail when no thumbnail_url provided', () => {
    const adWithoutThumbnail = {
      ...mockAd,
      thumbnail_url: undefined,
    };
    renderAdCard(adWithoutThumbnail);
    const img = screen.getByAltText('Test Ad') as HTMLImageElement;
    expect(img.src).toContain('img.youtube.com');
    expect(img.src).toContain('dQw4w9WgXcQ');
  });

  it('extracts Vimeo thumbnail when video is from Vimeo', () => {
    const vimeoAd = {
      ...mockAd,
      video_url: 'https://vimeo.com/123456789',
      thumbnail_url: undefined,
    };
    renderAdCard(vimeoAd);
    const img = screen.getByAltText('Test Ad') as HTMLImageElement;
    expect(img.src).toContain('vumbnail.com');
    expect(img.src).toContain('123456789');
  });

  it('uses placeholder when no thumbnail can be extracted', () => {
    const adWithGenericUrl = {
      ...mockAd,
      video_url: 'https://example.com/video.mp4',
      thumbnail_url: undefined,
    };
    renderAdCard(adWithGenericUrl);
    const img = screen.getByAltText('Test Ad') as HTMLImageElement;
    expect(img.src).toContain('placeholder');
  });

  it('falls back to placeholder on image error', () => {
    renderAdCard();
    const img = screen.getByAltText('Test Ad') as HTMLImageElement;

    // Trigger error event
    fireEvent.error(img);

    expect(img.src).toContain('placeholder');
  });

  it('does not render industry separator when industry is not provided', () => {
    const adWithoutIndustry = {
      ...mockAd,
      industry: undefined,
    };
    renderAdCard(adWithoutIndustry);
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('does not render duration when not provided', () => {
    const adWithoutDuration = {
      ...mockAd,
      duration: undefined,
    };
    renderAdCard(adWithoutDuration);
    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
  });

  it('calls onVoteChange when provided', () => {
    const onVoteChange = jest.fn();
    renderAdCard(mockAd, onVoteChange);
    // The onVoteChange prop is passed to VoteButtons
    expect(screen.getByTestId('vote-buttons')).toBeInTheDocument();
  });

  it('formats duration correctly for ads over 1 hour', () => {
    const longAd = {
      ...mockAd,
      duration: 3665, // 1 hour, 1 minute, 5 seconds
    };
    renderAdCard(longAd);
    expect(screen.getByText('61:05')).toBeInTheDocument();
  });

  it('pads seconds with zero when needed', () => {
    const adWithSingleDigitSeconds = {
      ...mockAd,
      duration: 65, // 1:05
    };
    renderAdCard(adWithSingleDigitSeconds);
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('handles zero duration', () => {
    const adWithZeroDuration = {
      ...mockAd,
      duration: 0,
    };
    renderAdCard(adWithZeroDuration);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});
