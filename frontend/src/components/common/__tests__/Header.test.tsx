import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
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

    it('renders the logo and site name', () => {
      renderHeader();
      expect(screen.getByText('AdImpressions')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('shows Login and Sign Up buttons', () => {
      renderHeader();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('navigates to login when Login button is clicked', () => {
      renderHeader();
      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to register when Sign Up button is clicked', () => {
      renderHeader();
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('does not show Admin link', () => {
      renderHeader();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('does not show user avatar', () => {
      renderHeader();
      const avatars = screen.queryAllByText(/^[A-Z]$/);
      expect(avatars.length).toBe(1); // Only the "AI" logo
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const,
      created_at: '2024-01-01',
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('shows username', () => {
      renderHeader();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('shows user avatar with first letter of username', () => {
      renderHeader();
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('shows Logout button', () => {
      renderHeader();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('does not show Login or Sign Up buttons', () => {
      renderHeader();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('calls logout and navigates when Logout is clicked', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: mockLogout,
        refreshUser: jest.fn(),
      });

      renderHeader();
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('does not show Admin link for regular users', () => {
      renderHeader();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('when user is admin', () => {
    const mockAdmin = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin' as const,
      created_at: '2024-01-01',
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockAdmin,
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('shows Admin link', () => {
      renderHeader();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
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

    it('renders Home link', () => {
      renderHeader();
      const homeLinks = screen.getAllByText('Home');
      expect(homeLinks.length).toBeGreaterThan(0);
    });

    it('renders Analytics link', () => {
      renderHeader();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });
});
