import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../useAuth';
import authService from '../../services/authService';
import { User, AuthResponse } from '../../types';

// Mock authService
jest.mock('../../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  created_at: '2024-01-01',
};

const mockAuthResponse: AuthResponse = {
  access_token: 'test-token-123',
  token_type: 'Bearer',
  user: mockUser,
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Default mocks
    mockAuthService.getStoredUser.mockReturnValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
  });

  describe('initialization', () => {
    it('initializes with no user when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('initializes with stored user when authenticated', async () => {
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('refreshes user data from server when authenticated', async () => {
      const updatedUser = { ...mockUser, username: 'updateduser' };

      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user?.username).toBe('updateduser');
      });

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('clears stored data if refresh fails', async () => {
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('logs in user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('sets loading state during login', async () => {
      mockAuthService.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loadingDuringLogin = false;

      act(() => {
        result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      // Check loading state
      if (result.current.isLoading) {
        loadingDuringLogin = true;
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringLogin).toBe(true);
    });

    it('handles login errors', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login({
            username: 'testuser',
            password: 'wrongpassword',
          });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('clears loading state after login error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      try {
        await act(async () => {
          await result.current.login({
            username: 'testuser',
            password: 'password123',
          });
        });
      } catch (error) {
        // Expected error
      }

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('registers user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      });
    });

    it('sets loading state during registration', async () => {
      mockAuthService.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loadingDuringRegister = false;

      act(() => {
        result.current.register({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      if (result.current.isLoading) {
        loadingDuringRegister = true;
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringRegister).toBe(true);
    });

    it('handles registration errors', async () => {
      const error = new Error('Username already exists');
      mockAuthService.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.register({
            username: 'existinguser',
            email: 'test@example.com',
            password: 'password123',
          });
        })
      ).rejects.toThrow('Username already exists');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('logs out user successfully', async () => {
      // First login
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockUser);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('sets loading state during logout', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.logout.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      let loadingDuringLogout = false;

      act(() => {
        result.current.logout();
      });

      if (result.current.isLoading) {
        loadingDuringLogout = true;
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringLogout).toBe(true);
    });

    it('clears user even if logout API call fails', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('refreshes user data when authenticated', async () => {
      const updatedUser = { ...mockUser, username: 'updateduser' };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.username).toBe('updateduser');
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('does not refresh when not authenticated', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(mockAuthService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('handles refresh errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Failed to refresh'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      // User should still be the old one since refresh failed
      expect(result.current.user).toEqual(mockUser);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to refresh user:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('token persistence', () => {
    it('persists user data across hook instances', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // First hook instance - login
      const { result: result1, unmount } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result1.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(result1.current.user).toEqual(mockUser);
      expect(result1.current.isAuthenticated).toBe(true);

      // Unmount first instance
      unmount();

      // Second hook instance - should restore from storage
      mockAuthService.getStoredUser.mockReturnValue(mockUser);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result: result2 } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result2.current.user).toEqual(mockUser);
      });

      expect(result2.current.isAuthenticated).toBe(true);
    });
  });

  describe('error cases', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuthContext must be used within AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
