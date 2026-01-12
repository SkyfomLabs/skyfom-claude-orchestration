import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Secure storage keys
const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Regular storage keys
const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;

/**
 * Secure token storage using expo-secure-store
 * iOS: Keychain, Android: EncryptedSharedPreferences
 */
export const secureStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
    ]);
  },
};

/**
 * Regular storage for non-sensitive data
 */
export const storage = {
  async saveUserData(userData: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
  },

  async getUserData(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  },

  async clearUserData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async setOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  },

  async isOnboardingComplete(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  },
};
