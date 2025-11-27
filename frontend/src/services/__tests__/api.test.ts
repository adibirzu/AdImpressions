import axios, { AxiosError } from 'axios';
import { apiClient } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Client', () => {
  let mockCreate: jest.Mock;
  let mockInterceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    mockInterceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    };

    mockCreate = jest.fn().mockReturnValue({
      interceptors: mockInterceptors,
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    });

    mockedAxios.create = mockCreate;
  });

  describe('initialization', () => {
    it('creates axios instance with correct base URL', () => {
      // Re-import to trigger initialization
      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('uses environment variable for API URL if available', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://custom-api.example.com';

      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'https://custom-api.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      process.env.REACT_APP_API_URL = originalEnv;
    });

    it('falls back to localhost if no environment variable', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      delete process.env.REACT_APP_API_URL;

      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      process.env.REACT_APP_API_URL = originalEnv;
    });
  });

  describe('request interceptor', () => {
    it('registers request interceptor', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockInterceptors.request.use).toHaveBeenCalled();
    });

    it('adds auth token to request headers when token exists', () => {
      localStorageMock.setItem('access_token', 'test-token-123');

      jest.isolateModules(() => {
        require('../api');
      });

      const requestInterceptor = mockInterceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('does not add auth token when no token exists', () => {
      localStorageMock.removeItem('access_token');

      jest.isolateModules(() => {
        require('../api');
      });

      const requestInterceptor = mockInterceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('handles request errors', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.request.use.mock.calls[0][1];
      const error = new Error('Request error');

      expect(() => errorHandler(error)).rejects.toThrow('Request error');
    });
  });

  describe('response interceptor', () => {
    it('registers response interceptor', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      expect(mockInterceptors.response.use).toHaveBeenCalled();
    });

    it('passes through successful responses', () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const successHandler = mockInterceptors.response.use.mock.calls[0][0];
      const response = { data: { message: 'success' }, status: 200 };
      const result = successHandler(response);

      expect(result).toEqual(response);
    });

    it('clears tokens and redirects on 401 error', () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { href: '' } as any;

      localStorageMock.setItem('access_token', 'test-token');
      localStorageMock.setItem('user', JSON.stringify({ id: '1', username: 'test' }));

      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      errorHandler(error);

      expect(localStorageMock.getItem('access_token')).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('handles errors with response data', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        response: {
          status: 400,
          data: { message: 'Bad request', details: { field: 'error' } },
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err.message).toBe('Bad request');
        expect(err.code).toBe('400');
        expect(err.details).toEqual({ field: 'error' });
      }
    });

    it('handles network errors', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        request: {},
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err.message).toBe('Network error. Please check your connection.');
        expect(err.code).toBe('NETWORK_ERROR');
      }
    });

    it('handles unknown errors', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        message: 'Unknown error',
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err.message).toBe('Unknown error');
        expect(err.code).toBe('UNKNOWN_ERROR');
      }
    });

    it('handles errors with default message', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err.message).toBe('An error occurred');
        expect(err.code).toBe('500');
      }
    });
  });

  describe('error handling', () => {
    it('transforms axios errors into API errors', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const error: Partial<AxiosError> = {
        response: {
          status: 404,
          data: { message: 'Not found', details: { id: '123' } },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err).toHaveProperty('message');
        expect(err).toHaveProperty('code');
        expect(err.message).toBe('Not found');
        expect(err.code).toBe('404');
      }
    });

    it('preserves error details in API error', async () => {
      jest.isolateModules(() => {
        require('../api');
      });

      const errorHandler = mockInterceptors.response.use.mock.calls[0][1];
      const errorDetails = { field: 'email', reason: 'invalid format' };
      const error: Partial<AxiosError> = {
        response: {
          status: 422,
          data: { message: 'Validation error', details: errorDetails },
          statusText: 'Unprocessable Entity',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      try {
        await errorHandler(error);
      } catch (err: any) {
        expect(err.details).toEqual(errorDetails);
      }
    });
  });
});
