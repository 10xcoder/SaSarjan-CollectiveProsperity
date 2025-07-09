# @sasarjan/auth

Secure, unified authentication package for the SaSarjan ecosystem with enterprise-grade security features.

## Features

### 🔐 Core Security
- **Secure Cookies**: HTTP-only, secure, SameSite cookies with CSRF protection
- **JWT Tokens**: RS256/ES256 signed tokens with automatic rotation
- **Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Device Fingerprinting**: Bind sessions to devices
- **Session Management**: Activity monitoring and automatic expiration

### 🔄 Cross-App Sync
- **Single Sign-On (SSO)**: Login once, access all apps
- **HMAC Signing**: Cryptographically signed messages
- **Replay Protection**: Nonce-based prevention
- **Secure Communication**: Optional end-to-end encryption
- **Shared State Management**: Synchronized auth state across apps

### 🛡️ Additional Security
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Double-submit cookie pattern
- **Secure Storage**: Encrypted local storage
- **Key Management**: Automatic key rotation
- **PKCE Flow**: OAuth security enhancement

## Quick Start

### Installation

```bash
pnpm add @sasarjan/auth
```

### Basic Setup

```typescript
// app/providers.tsx
import { UnifiedAuthProvider } from '@sasarjan/auth/client'

export function Providers({ children }) {
  const authConfig = {
    appId: 'your-app-id',
    appName: 'Your App Name',
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    
    // Security features
    useSecureTokens: true,
    enableSecureCrossAppSync: true,
    hmacSecret: process.env.HMAC_SECRET_KEY,
    
    // Supabase config
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
  
  return (
    <UnifiedAuthProvider config={authConfig}>
      {children}
    </UnifiedAuthProvider>
  )
}
```

### Using Auth in Components

```typescript
import { useAuth } from '@sasarjan/auth/client'

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!user) {
    return (
      <button onClick={() => signIn('email@example.com', 'password')}>
        Sign In
      </button>
    )
  }
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@sasarjan/auth/client'

function AdminPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <h1>Admin Dashboard</h1>
      {/* Protected content */}
    </ProtectedRoute>
  )
}
```

## Advanced Features

### Secure Cross-App Sync

Enable secure communication between apps:

```typescript
const authConfig = {
  enableSecureCrossAppSync: true,
  hmacSecret: process.env.HMAC_SECRET_KEY,
}
```

Features:
- HMAC-SHA256 message signing
- Nonce-based replay protection
- Message age validation (5-minute TTL)
- Trusted app registry

### Custom Session Timeout

```typescript
const authConfig = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  activityTimeout: 30 * 60 * 1000, // 30 minutes
}
```

### Server-Side Usage

For API routes:

```typescript
import { jwtProtection, getRequestUser } from '@sasarjan/auth/server'

// Protect API route
export const POST = jwtProtection(async (req) => {
  const user = await getRequestUser(req)
  
  // Your protected logic here
})
```

### Cross-App Authentication Events

```typescript
import { useAuthActions } from '@sasarjan/auth'

function App() {
  const { addEventListener } = useAuthActions()

  useEffect(() => {
    // Listen for auth events from other apps
    const unsubscribe = addEventListener((event) => {
      console.log('Auth event from another app:', event)

      switch (event.type) {
        case 'SIGN_IN':
          // User signed in from another app
          break
        case 'SIGN_OUT':
          // User signed out from another app
          break
        case 'USER_UPDATED':
          // User profile updated from another app
          break
      }
    })

    return unsubscribe
  }, [addEventListener])

  return <YourApp />
}
```

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to git
   - Use strong, random HMAC secrets (32+ characters)
   - Rotate keys periodically

2. **Cookie Settings**
   - Always use HTTPS in production
   - Set proper cookie domain
   - Enable SameSite protection

3. **Token Management**
   - Enable automatic rotation
   - Use short token lifetimes
   - Implement refresh tokens

4. **Cross-App Security**
   - Register trusted apps only
   - Verify message signatures
   - Monitor for anomalies

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Recommended for production
HMAC_SECRET_KEY=your-very-secure-random-key-at-least-32-chars
NEXT_PUBLIC_COOKIE_DOMAIN=.yourdomain.com
TOKEN_ENCRYPTION_KEY=another-secure-random-key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret

# Optional
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
```

## API Reference

### Hooks

- `useAuth()` - Main auth hook with all methods
- `useUser()` - Get current user
- `useSession()` - Get current session
- `useRequireAuth()` - Require authentication

### Components

- `UnifiedAuthProvider` - Auth context provider
- `ProtectedRoute` - Route protection
- `LoginForm` - Ready-to-use login form

### Services

- `AuthService` - Core authentication service
- `AuthServer` - Server-side utilities
- `SessionManager` - Session management
- `SecureTokenManager` - Token handling

### Utilities

- `getHMACValidator()` - HMAC signing
- `getKeyExchange()` - Key exchange utilities
- `getSecureMessaging()` - Encrypted messaging
- `getNonceManager()` - Replay protection

## Examples

See the `/examples` directory for:
- Basic authentication
- Cross-app sync setup
- Secure messaging
- Server-side auth
- Custom implementations

## Migration Guide

### From localStorage to Secure Cookies

The auth package automatically migrates existing localStorage tokens to secure cookies:

```typescript
// Automatic migration happens on initialization
// No code changes required
```

### From Basic to Secure Cross-App Sync

```typescript
// Change from:
enableCrossAppSync: true

// To:
enableSecureCrossAppSync: true
hmacSecret: process.env.HMAC_SECRET_KEY
```

## Security Features Summary

✅ **Implemented**
- Secure HTTP-only cookies
- CSRF protection
- JWT token rotation
- Device fingerprinting
- AES-256-GCM encryption
- HMAC message signing
- Replay attack prevention
- Cross-app SSO

🔜 **Future Enhancements** (see [future-security-backlog.md](./docs/future-security-backlog.md))
- Rate limiting
- Fraud detection
- Advanced monitoring
- Compliance features

## Contributing

See the main project README for contribution guidelines.

## License

MIT