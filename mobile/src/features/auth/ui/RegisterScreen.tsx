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
import { registerSchema, type RegisterFormData } from '@entities/user/types';

/**
 * RegisterScreen Component
 *
 * Features:
 * - User registration with email, name, and password
 * - Password confirmation validation
 * - Form validation with Zod
 * - Secure token storage after registration
 * - Material Design 3 (Android) and HIG (iOS) compliance
 * - Accessibility support
 * - Error handling with user feedback
 */
export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error: authError } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleRegister = async () => {
    try {
      // Clear previous errors
      setErrors({});

      // Validate form data
      const validatedData = registerSchema.parse(formData);

      // Attempt registration
      await register(validatedData);

      // Navigation handled by auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // API or other errors
        Alert.alert(
          'Registration Failed',
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

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
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              isPassword
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              error={errors.confirmPassword}
              isPassword
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />

            {authError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={isLoading}
            />

            {/* Terms */}
            <Text style={styles.terms}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Sign In"
              variant="secondary"
              onPress={() => router.back()}
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
  terms: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '600',
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
