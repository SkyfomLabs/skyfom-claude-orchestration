# Skyfom Mobile Authentication

React Native Expo mobile application with authentication features following Material Design 3 (Android) and Human Interface Guidelines (iOS).

## Features

### Authentication
- **LoginScreen**: Email/password authentication with validation
- **RegisterScreen**: User registration with password confirmation
- **Secure Token Storage**: iOS Keychain and Android EncryptedSharedPreferences
- **Auth State Management**: Zustand store with persistence
- **Form Validation**: Zod schema validation with user-friendly error messages
- **Protected Routes**: Automatic navigation based on auth state

### Architecture
- **Feature-Sliced Design (FSD)**: Organized, maintainable code structure
- **TypeScript Strict Mode**: Type-safe development
- **Expo Router**: File-based navigation with typed routes
- **Platform-Specific UI**: Material Design 3 (Android) and HIG (iOS) compliance

### Accessibility
- Screen reader support
- Proper ARIA labels and hints
- Keyboard navigation
- Haptic feedback on iOS

## Project Structure

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout with auth restoration
│   ├── index.tsx                # Entry point with auth redirect
│   ├── login.tsx                # Login screen route
│   ├── register.tsx             # Register screen route
│   └── (tabs)/                  # Authenticated app
│       ├── _layout.tsx          # Tabs layout
│       ├── index.tsx            # Home screen
│       └── profile.tsx          # Profile screen
│
├── src/
│   ├── features/                # Feature modules
│   │   └── auth/
│   │       └── ui/
│   │           ├── LoginScreen.tsx
│   │           └── RegisterScreen.tsx
│   │
│   ├── entities/                # Business entities
│   │   └── user/
│   │       ├── types.ts         # TypeScript types and Zod schemas
│   │       ├── store.ts         # Zustand auth store
│   │       └── store.test.ts    # Store tests
│   │
│   └── shared/                  # Shared resources
│       ├── ui/                  # UI components
│       │   ├── Button.tsx
│       │   ├── Button.test.tsx
│       │   ├── Input.tsx
│       │   └── Input.test.tsx
│       └── lib/                 # Utilities
│           ├── storage.ts       # Secure storage utilities
│           └── storage.test.ts
│
├── package.json
├── app.json                     # Expo configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration
└── jest.setup.js               # Jest setup with mocks
```

## Installation

```bash
cd mobile

# Install dependencies (use npm, yarn, or pnpm)
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run component tests only
npm run test:components
```

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | React Native + Expo 51 | Cross-platform mobile development |
| Language | TypeScript (strict) | Type-safe development |
| Navigation | Expo Router | File-based routing |
| State Management | Zustand | Lightweight state management |
| Validation | Zod | Schema validation |
| Secure Storage | expo-secure-store | Token storage (Keychain/EncryptedSharedPreferences) |
| Regular Storage | @react-native-async-storage | Non-sensitive data storage |
| Haptics | expo-haptics | Tactile feedback (iOS) |
| Testing | Jest + React Native Testing Library | Unit and component testing |

## Key Components

### LoginScreen
- Email/password input with validation
- Password visibility toggle
- Form validation with Zod
- Loading states
- Error handling
- Accessibility support

### RegisterScreen
- Full name, email, password, and confirm password fields
- Password match validation
- Terms of service acknowledgment
- Form validation with Zod
- Loading states
- Error handling

### Auth Store (Zustand)
```typescript
interface AuthStore {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### Secure Storage
- `secureStorage.saveTokens()` - Save access and refresh tokens
- `secureStorage.getAccessToken()` - Retrieve access token
- `secureStorage.getRefreshToken()` - Retrieve refresh token
- `secureStorage.clearTokens()` - Clear all tokens

### Regular Storage
- `storage.saveUserData()` - Save user profile data
- `storage.getUserData()` - Retrieve user profile data
- `storage.clearUserData()` - Clear user data
- `storage.setOnboardingComplete()` - Mark onboarding complete
- `storage.isOnboardingComplete()` - Check onboarding status

## Navigation Flow

```
index.tsx (Entry Point)
    │
    ├─ isAuthenticated? ──► (tabs)/ (Protected)
    │                         ├─ index.tsx (Home)
    │                         └─ profile.tsx (Profile)
    │
    └─ !isAuthenticated ──► login.tsx
                              │
                              └─ register.tsx
```

## Platform-Specific Features

### iOS
- SF Symbols (when integrated)
- Haptic feedback on button press
- iOS-style shadows and corners
- Face ID/Touch ID ready (expo-local-authentication)

### Android
- Material Design 3 elevation
- Material You dynamic colors (ready for theming)
- Rounded corners per Material guidelines
- Biometric authentication ready

## Security

- **Secure Token Storage**: Uses iOS Keychain and Android EncryptedSharedPreferences
- **Password Validation**: Minimum 8 characters
- **Email Validation**: RFC-compliant email validation
- **No Plain Text Passwords**: Never stored in plain text
- **Auto-logout**: Can be extended with token refresh logic

## API Integration

The current implementation uses mock API functions. To integrate with a real backend:

1. Replace mock functions in `src/entities/user/store.ts`:
   - `mockLoginApi()` → Call your login endpoint
   - `mockRegisterApi()` → Call your registration endpoint

2. Example integration:
```typescript
async function loginApi(data: LoginFormData) {
  const response = await fetch('https://api.example.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}
```

## Future Enhancements

- [ ] Biometric authentication (Face ID, Touch ID, Fingerprint)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Social auth (Google, Apple)
- [ ] Offline-first sync
- [ ] Token refresh mechanism
- [ ] Deep linking
- [ ] Push notifications

## Development Guidelines

### Code Style
- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Add accessibility labels
- Write tests for critical paths

### Testing
- Unit tests for utilities and stores
- Component tests for UI components
- E2E tests with Maestro (future)
- Maintain >80% code coverage

### Accessibility
- Always add `accessible={true}`
- Provide `accessibilityLabel` and `accessibilityHint`
- Use `accessibilityRole` appropriately
- Test with screen readers

### Performance
- Use `useMemo`/`useCallback` for expensive operations
- Implement proper list virtualization
- Optimize images with expo-image
- Profile with Flipper

## License

Copyright © 2026 Skyfom. All rights reserved.

## Support

For issues or questions, please create a ticket in Beads or contact the mobile development team.
