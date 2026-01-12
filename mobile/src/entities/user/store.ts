import { create } from 'zustand';
import { AuthState, User, AuthTokens, LoginFormData, RegisterFormData } from './types';
import { secureStorage, storage } from '@shared/lib/storage';

interface AuthActions {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Authentication store using Zustand
 * Manages user state and authentication tokens
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (data: LoginFormData) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      const response = await mockLoginApi(data);

      // Save tokens securely
      await secureStorage.saveTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );

      // Save user data
      await storage.saveUserData(JSON.stringify(response.user));

      set({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterFormData) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      const response = await mockRegisterApi(data);

      // Save tokens securely
      await secureStorage.saveTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );

      // Save user data
      await storage.saveUserData(JSON.stringify(response.user));

      set({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // Clear secure tokens
      await secureStorage.clearTokens();

      // Clear user data
      await storage.clearUserData();

      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  refreshAuth: async () => {
    set({ isLoading: true });

    try {
      // Try to restore auth state from storage
      const [accessToken, refreshToken, userDataStr] = await Promise.all([
        secureStorage.getAccessToken(),
        secureStorage.getRefreshToken(),
        storage.getUserData(),
      ]);

      if (accessToken && refreshToken && userDataStr) {
        const user = JSON.parse(userDataStr) as User;
        const tokens: AuthTokens = { accessToken, refreshToken };

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),
}));

// Mock API functions (replace with actual API calls)
async function mockLoginApi(data: LoginFormData): Promise<{ user: User; tokens: AuthTokens }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response
  return {
    user: {
      id: '1',
      email: data.email,
      name: 'Test User',
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    },
  };
}

async function mockRegisterApi(data: RegisterFormData): Promise<{ user: User; tokens: AuthTokens }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response
  return {
    user: {
      id: '1',
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    },
  };
}
