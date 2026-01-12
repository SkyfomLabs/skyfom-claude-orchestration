import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage, storage } from './storage';

describe('Secure Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTokens', () => {
    it('saves access and refresh tokens', async () => {
      await secureStorage.saveTokens('access_token', 'refresh_token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'access_token',
        'access_token'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_token'
      );
    });
  });

  describe('getAccessToken', () => {
    it('retrieves access token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored_access_token');

      const token = await secureStorage.getAccessToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('access_token');
      expect(token).toBe('stored_access_token');
    });
  });

  describe('getRefreshToken', () => {
    it('retrieves refresh token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored_refresh_token');

      const token = await secureStorage.getRefreshToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refresh_token');
      expect(token).toBe('stored_refresh_token');
    });
  });

  describe('clearTokens', () => {
    it('clears both tokens', async () => {
      await secureStorage.clearTokens();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });
  });
});

describe('Regular Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUserData', () => {
    it('saves user data', async () => {
      const userData = JSON.stringify({ id: '1', name: 'Test' });
      await storage.saveUserData(userData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_data',
        userData
      );
    });
  });

  describe('getUserData', () => {
    it('retrieves user data', async () => {
      const userData = JSON.stringify({ id: '1', name: 'Test' });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(userData);

      const result = await storage.getUserData();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user_data');
      expect(result).toBe(userData);
    });
  });

  describe('clearUserData', () => {
    it('clears user data', async () => {
      await storage.clearUserData();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@user_data');
    });
  });

  describe('onboarding', () => {
    it('sets onboarding complete', async () => {
      await storage.setOnboardingComplete();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@onboarding_complete',
        'true'
      );
    });

    it('checks if onboarding is complete', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await storage.isOnboardingComplete();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@onboarding_complete');
      expect(result).toBe(true);
    });

    it('returns false if onboarding not complete', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storage.isOnboardingComplete();

      expect(result).toBe(false);
    });
  });
});
