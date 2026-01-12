import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Sign In" onPress={() => {}} />
    );
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('handles press events', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Sign In" onPress={mockPress} />
    );

    fireEvent.press(getByText('Sign In'));
    expect(mockPress).toHaveBeenCalled();
  });

  it('shows loading indicator when isLoading is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Sign In" onPress={() => {}} isLoading />
    );

    // Title should not be visible
    expect(queryByText('Sign In')).toBeNull();

    // ActivityIndicator should be visible
    const indicator = UNSAFE_getByType(require('react-native').ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Sign In" onPress={mockPress} disabled />
    );

    const button = getByText('Sign In').parent?.parent;
    expect(button?.props.disabled).toBe(true);

    fireEvent.press(getByText('Sign In'));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('is disabled when isLoading is true', () => {
    const mockPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <Button title="Sign In" onPress={mockPress} isLoading />
    );

    const pressable = UNSAFE_getByType(require('react-native').Pressable);
    expect(pressable.props.disabled).toBe(true);
  });

  it('applies correct variant styles', () => {
    const { getByText, rerender } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <Button title="Secondary" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();

    rerender(
      <Button title="Outline" onPress={() => {}} variant="outline" />
    );
    expect(getByText('Outline')).toBeTruthy();
  });

  it('is accessible', () => {
    const { UNSAFE_getByType } = render(
      <Button title="Sign In" onPress={() => {}} disabled />
    );

    const pressable = UNSAFE_getByType(require('react-native').Pressable);
    expect(pressable.props.accessible).toBe(true);
    expect(pressable.props.accessibilityRole).toBe('button');
    expect(pressable.props.accessibilityLabel).toBe('Sign In');
    expect(pressable.props.accessibilityState.disabled).toBe(true);
  });
});
