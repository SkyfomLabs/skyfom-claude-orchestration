import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  type TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: object;
  isPassword?: boolean;
}

/**
 * Custom Input component following Material Design 3 and HIG
 * Includes accessibility support and platform-specific styling
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
          {...props}
        />
        {isPassword && (
          <Pressable
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Platform.select({ ios: 10, android: 12 }),
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  toggleText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});
