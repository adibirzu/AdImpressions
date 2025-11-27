import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VoteButtons from '../VoteButtons';
import { useVoting } from '../../../hooks/useVoting';
import { useAuth } from '../../../hooks/useAuth';
import { Vote, VoteStats } from '../../../types';

// Mock hooks
jest.mock('../../../hooks/useVoting');
jest.mock('../../../hooks/useAuth');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseVoting = useVoting as jest.MockedFunction<typeof useVoting>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const defaultVoteStats: VoteStats = {
  upvotes: 100,
  downvotes: 20,
  net_votes: 80,
  total_votes: 120,
  upvote_percentage: 83.3,
};

const renderVoteButtons = (props: any = {}) => {
  const defaultProps = {
    adId: 'ad-1',
    initialUpvotes: 100,
    initialDownvotes: 20,
    size: 'md' as const,
    showCounts: true,
    ...props,
  };

  return render(
    <BrowserRouter>
      <VoteButtons {...defaultProps} />
    </BrowserRouter>
  );
};

describe('VoteButtons Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user', created_at: '2024-01-01' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockUseVoting.mockReturnValue({
      userVote: null,
      voteStats: defaultVoteStats,
      loading: false,
      error: null,
      upvote: jest.fn(),
      downvote: jest.fn(),
      refetch: jest.fn(),
    });
  });

  describe('rendering', () => {
    it('renders upvote and downvote buttons', () => {
      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('displays vote count when showCounts is true', () => {
      renderVoteButtons({ showCounts: true });
      expect(screen.getByText('+80')).toBeInTheDocument();
    });

    it('does not display vote count when showCounts is false', () => {
      renderVoteButtons({ showCounts: false });
      expect(screen.queryByText('+80')).not.toBeInTheDocument();
    });

    it('shows positive net votes with + prefix', () => {
      renderVoteButtons();
      expect(screen.getByText('+80')).toBeInTheDocument();
    });

    it('shows negative net votes without + prefix', () => {
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: { ...defaultVoteStats, upvotes: 20, downvotes: 100, net_votes: -80 },
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      expect(screen.getByText('-80')).toBeInTheDocument();
    });

    it('shows zero net votes without prefix', () => {
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: { ...defaultVoteStats, upvotes: 50, downvotes: 50, net_votes: 0 },
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('button sizes', () => {
    it('applies small size classes', () => {
      renderVoteButtons({ size: 'sm' });
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('p-1');
      });
    });

    it('applies medium size classes by default', () => {
      renderVoteButtons({ size: 'md' });
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('p-2');
      });
    });

    it('applies large size classes', () => {
      renderVoteButtons({ size: 'lg' });
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('p-3');
      });
    });
  });

  describe('user vote state', () => {
    it('highlights upvote button when user has upvoted', () => {
      const userUpvote: Vote = {
        id: 'vote-1',
        ad_id: 'ad-1',
        user_id: 'user-1',
        vote_type: 'upvote',
        created_at: '2024-01-01',
      };

      mockUseVoting.mockReturnValue({
        userVote: userUpvote,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('bg-green-600');
    });

    it('highlights downvote button when user has downvoted', () => {
      const userDownvote: Vote = {
        id: 'vote-1',
        ad_id: 'ad-1',
        user_id: 'user-1',
        vote_type: 'downvote',
        created_at: '2024-01-01',
      };

      mockUseVoting.mockReturnValue({
        userVote: userDownvote,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toHaveClass('bg-red-600');
    });

    it('does not highlight any button when user has not voted', () => {
      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).not.toHaveClass('bg-green-600');
      expect(buttons[1]).not.toHaveClass('bg-red-600');
    });
  });

  describe('voting actions', () => {
    it('calls upvote when upvote button is clicked', async () => {
      const mockUpvote = jest.fn().mockResolvedValue(undefined);
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: mockUpvote,
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(mockUpvote).toHaveBeenCalled();
      });
    });

    it('calls downvote when downvote button is clicked', async () => {
      const mockDownvote = jest.fn().mockResolvedValue(undefined);
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: mockDownvote,
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      await waitFor(() => {
        expect(mockDownvote).toHaveBeenCalled();
      });
    });

    it('calls onVoteChange callback after voting', async () => {
      const onVoteChange = jest.fn();
      const mockUpvote = jest.fn().mockResolvedValue(undefined);

      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: mockUpvote,
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons({ onVoteChange });
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(onVoteChange).toHaveBeenCalled();
      });
    });

    it('does not call onVoteChange when vote fails', async () => {
      const onVoteChange = jest.fn();
      const mockUpvote = jest.fn().mockRejectedValue(new Error('Vote failed'));

      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: mockUpvote,
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons({ onVoteChange });
      const buttons = screen.getAllByRole('button');

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(mockUpvote).toHaveBeenCalled();
      });

      expect(onVoteChange).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('unauthenticated user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('navigates to login when upvote is clicked', () => {
      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to login when downvote is clicked', () => {
      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('does not call vote functions when not authenticated', () => {
      const mockUpvote = jest.fn();
      const mockDownvote = jest.fn();

      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: mockUpvote,
        downvote: mockDownvote,
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(mockUpvote).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('loading state', () => {
    it('disables buttons when loading', () => {
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: true,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('vote stats fallback', () => {
    it('uses initial values when voteStats is null', () => {
      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: null,
        loading: false,
        error: null,
        upvote: jest.fn(),
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      renderVoteButtons({ initialUpvotes: 50, initialDownvotes: 10 });
      expect(screen.getByText('+40')).toBeInTheDocument();
    });
  });

  describe('event propagation', () => {
    it('stops click propagation when voting', () => {
      const parentClick = jest.fn();
      const mockUpvote = jest.fn().mockResolvedValue(undefined);

      mockUseVoting.mockReturnValue({
        userVote: null,
        voteStats: defaultVoteStats,
        loading: false,
        error: null,
        upvote: mockUpvote,
        downvote: jest.fn(),
        refetch: jest.fn(),
      });

      const { container } = render(
        <BrowserRouter>
          <div onClick={parentClick}>
            <VoteButtons adId="ad-1" />
          </div>
        </BrowserRouter>
      );

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(parentClick).not.toHaveBeenCalled();
    });
  });
});
