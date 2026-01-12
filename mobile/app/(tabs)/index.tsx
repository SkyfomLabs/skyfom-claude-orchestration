import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/entities/user/store';

/**
 * Home Screen (Protected)
 */
export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name}!</Text>
      <Text style={styles.subtitle}>You are now authenticated</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
