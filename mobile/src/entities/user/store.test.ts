import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from './store';
import { secureStorage, storage } from '@shared/lib/storage';

// Mock the storage modules
jest.mock('@shared/lib/storage', () => ({
  secureStorage: {
    saveTokens: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
  storage: {
    saveUserData: jest.fn(),
    getUserData: jest.fn(),
    clearUserData: jest.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('login', () => {
    it('successfully logs in a user', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.tokens).toBeTruthy();
      expect(result.current.error).toBeNull();

      expect(secureStorage.saveTokens).toHaveBeenCalled();
      expect(storage.saveUserData).toHaveBeenCalled();
    });

    it('sets loading state during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      let loadingDuringLogin = false;

      const loginPromise = act(async () => {
        const promise = result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });

        loadingDuringLogin = result.current.isLoading;
        await promise;
      });

      await loginPromise;

      expect(loadingDuringLogin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('successfully registers a user', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.name).toBe('Test User');
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.tokens).toBeTruthy();

      expect(secureStorage.saveTokens).toHaveBeenCalled();
      expect(storage.saveUserData).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears user data and tokens', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.error).toBeNull();

      expect(secureStorage.clearTokens).toHaveBeenCalled();
      expect(storage.clearUserData).toHaveBeenCalled();
    });
  });

  describe('refreshAuth', () => {
    it('restores auth state from storage', async () => {
      (secureStorage.getAccessToken as jest.Mock).mockResolvedValue('access_token');
      (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh_token');
      (storage.getUserData as jest.Mock).mockResolvedValue(
        JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString(),
        })
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.tokens).toBeTruthy();
    });

    it('does not restore auth if no tokens found', async () => {
      (secureStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
      (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('error handling', () => {
    it('sets error message on failed operation', async () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
    });

    it('clears error message', async () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
