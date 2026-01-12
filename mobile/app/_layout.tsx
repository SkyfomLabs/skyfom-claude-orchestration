import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/src/entities/user/store';

/**
 * Root Layout Component
 * Handles app initialization and auth state restoration
 */
export default function RootLayout() {
  const { refreshAuth } = useAuthStore();

  useEffect(() => {
    // Restore auth state on app launch
    refreshAuth();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
