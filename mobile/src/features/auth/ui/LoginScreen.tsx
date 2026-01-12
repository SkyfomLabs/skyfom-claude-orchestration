import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { useAuthStore } from '@entities/user/store';
import { loginSchema, type LoginFormData } from '@entities/user/types';

/**
 * LoginScreen Component
 *
 * Features:
 * - Email/password authentication
 * - Form validation with Zod
 * - Secure token storage
 * - Material Design 3 (Android) and HIG (iOS) compliance
 * - Accessibility support
 * - Error handling with user feedback
 */
export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleLogin = async () => {
    try {
      // Clear previous errors
      setErrors({});

      // Validate form data
      const validatedData = loginSchema.parse(formData);

      // Attempt login
      await login(validatedData);

      // Navigation handled by auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // API or other errors
        Alert.alert(
          'Login Failed',
          error.message || 'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              isPassword
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
            />

            {authError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={isLoading}
            />

            <Button
              title="Forgot Password?"
              variant="outline"
              onPress={() => {
                // TODO: Navigate to forgot password screen
                Alert.alert('Coming Soon', 'Password reset functionality will be available soon.');
              }}
              disabled={isLoading}
              style={styles.forgotButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Button
              title="Sign Up"
              variant="secondary"
              onPress={() => router.push('/register')}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  forgotButton: {
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
});
