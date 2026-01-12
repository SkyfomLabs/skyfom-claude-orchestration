import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Custom Button component following Material Design 3 and HIG
 * Includes haptic feedback on iOS and accessibility support
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (isLoading || disabled) return;

    // Haptic feedback on iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.(event);
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.textPrimary,
            variant === 'secondary' && styles.textSecondary,
            variant === 'outline' && styles.textOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Platform.select({ ios: 10, android: 12 }),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#374151',
  },
  textOutline: {
    color: '#3B82F6',
  },
});
