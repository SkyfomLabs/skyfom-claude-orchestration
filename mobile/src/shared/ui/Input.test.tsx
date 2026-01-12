import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(
      <Input label="Email" value="" onChangeText={() => {}} />
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const { getByText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={() => {}}
        error="Invalid email"
      />
    );
    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('handles text input changes', () => {
    const mockOnChange = jest.fn();
    const { getByLabelText } = render(
      <Input label="Email" value="" onChangeText={mockOnChange} />
    );

    const input = getByLabelText('Email');
    fireEvent.changeText(input, 'test@example.com');

    expect(mockOnChange).toHaveBeenCalledWith('test@example.com');
  });

  it('toggles password visibility', () => {
    const { getByText, getByLabelText } = render(
      <Input
        label="Password"
        value="secret123"
        onChangeText={() => {}}
        isPassword
      />
    );

    const input = getByLabelText('Password');
    const toggleButton = getByText('Show');

    // Initially password should be hidden
    expect(input.props.secureTextEntry).toBe(true);

    // Click show button
    fireEvent.press(toggleButton);

    // Password should now be visible
    expect(getByText('Hide')).toBeTruthy();
  });

  it('is accessible', () => {
    const { getByLabelText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={() => {}}
        error="Error message"
      />
    );

    const input = getByLabelText('Email');
    expect(input.props.accessible).toBe(true);
    expect(input.props.accessibilityHint).toBe('Error message');
  });
});
