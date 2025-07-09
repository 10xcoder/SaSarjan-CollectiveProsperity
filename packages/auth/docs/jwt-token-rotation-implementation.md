# JWT Token Rotation Implementation Guide

## Overview
Phase 1.2 has been successfully completed. We've replaced the weak token generation system with secure JWT signing using RS256 algorithm and added device fingerprint binding for enhanced security.

## New Features

### 1. JWT Utilities (`jwt.ts`)
- **Secure Token Generation**: Uses RS256/ES256 algorithms with proper key management
- **Token Verification**: Validates signatures, claims, and expiration
- **Token Rotation**: Automatic rotation at 80% of token lifetime
- **Device Fingerprint Binding**: Prevents token theft by binding to device characteristics
- **Token Revocation**: Blacklist support for immediate token invalidation

### 2. Secure Token Service (`secure-token-service.ts`)
- **Session Management**: Creates and validates secure JWT sessions
- **Automatic Rotation**: Schedules token rotation before expiry
- **Fingerprint Validation**: Validates device fingerprint on each request
- **Cookie Integration**: Stores tokens in secure httpOnly cookies

### 3. Secure Token Manager (`secure-token-manager.ts`)
- **Client-Side Management**: Handles tokens on the client side
- **Device Fingerprinting**: Collects WebGL, screen, and browser info
- **Auto-Refresh**: Automatically refreshes tokens when needed
- **CSRF Integration**: Includes CSRF tokens in all requests

### 4. JWT Middleware (`jwt-middleware.ts`)
- **Request Authentication**: Validates JWT tokens on API routes
- **Role-Based Access**: Support for role and permission checks
- **Token Expiry Headers**: Notifies clients when tokens are about to expire
- **Flexible Configuration**: Exclude paths, custom error handlers

## Implementation Details

### Token Structure
```typescript
{
  // Standard JWT Claims
  sub: "user-id",           // Subject (user ID)
  iss: "sasarjan-auth",     // Issuer
  aud: "sasarjan-apps",     // Audience
  exp: 1234567890,          // Expiration time
  iat: 1234567890,          // Issued at
  nbf: 1234567890,          // Not before
  jti: "unique-token-id",   // JWT ID for revocation
  
  // Custom Claims
  email: "user@example.com",
  fingerprint: "device-hash",
  sessionId: "session-id",
  roles: ["customer"],
  permissions: [],
  type: "access" | "refresh",
  metadata: {}
}
```

### Device Fingerprinting
Collects and hashes:
- User Agent
- Screen Resolution
- Timezone
- Language
- Color Depth
- Platform
- WebGL Renderer

## Usage Examples

### Generate JWT Keys
```bash
# Run from auth package directory
pnpm generate-keys

# This creates .env.example with:
# - JWT_PRIVATE_KEY (RS256 private key)
# - JWT_PUBLIC_KEY (RS256 public key)
# - COOKIE_SECRET placeholder
```

### Client-Side Usage
```typescript
import { getSecureTokenManager } from '@sasarjan/auth'

// Initialize secure token manager
const tokenManager = getSecureTokenManager({
  enableFingerprinting: true,
  autoRotation: true,
  jwtConfig: {
    algorithm: 'RS256',
    issuer: 'sasarjan-auth'
  }
})

// Create session
const session = await tokenManager.createSession(user, {
  loginMethod: 'email'
})

// Get access token (auto-refreshes if needed)
const token = await tokenManager.getAccessToken()

// Get auth headers with CSRF token
const headers = await tokenManager.getAuthHeaders()
// Returns: { Authorization: 'Bearer ...', 'X-CSRF-Token': '...' }
```

### Server-Side Usage
```typescript
import { withJWTAuth, getRequestUser, requireRoles } from '@sasarjan/auth'

// Protect API route with JWT
export default withJWTAuth(async (req, res) => {
  const user = getRequestUser(req)
  
  res.json({ 
    message: 'Authenticated!',
    userId: user.sub,
    email: user.email
  })
})

// With role requirements
export default withJWTAuth(async (req, res) => {
  requireRoles(['admin'])(req, res)
  
  // Only admins reach here
  res.json({ message: 'Admin access granted' })
})

// Express middleware
import { jwtProtection } from '@sasarjan/auth'

app.use(jwtProtection({
  excludePaths: ['/api/auth/login', '/api/health'],
  requireAuth: true
}))
```

## Security Improvements

### Before (Weak Implementation)
- Simple XOR encryption with hardcoded key
- No signature verification
- No device binding
- Manual token generation
- No revocation support

### After (Secure Implementation)
- RS256/ES256 cryptographic signatures
- Device fingerprint validation
- Automatic token rotation
- Token blacklist for revocation
- Secure key management
- JWT standard compliance

## Migration Guide

### 1. Generate Keys
```bash
cd packages/auth
pnpm generate-keys
```

### 2. Set Environment Variables
Copy generated keys to each app's `.env.local`:
```env
JWT_PRIVATE_KEY=<generated-private-key>
JWT_PUBLIC_KEY=<generated-public-key>
COOKIE_SECRET=<generate-strong-random-string>
```

### 3. Update Token Manager Usage
```typescript
// Old
import { getTokenManager } from '@sasarjan/auth'
const tokenManager = getTokenManager()

// New
import { getSecureTokenManager } from '@sasarjan/auth'
const tokenManager = getSecureTokenManager({
  enableFingerprinting: true
})
```

### 4. Update API Routes
```typescript
// Old - No protection
export default async function handler(req, res) {
  // Unprotected route
}

// New - JWT protected
import { withJWTAuth } from '@sasarjan/auth'

export default withJWTAuth(async (req, res) => {
  // Protected route with req.user available
})
```

## Token Lifecycle

1. **Creation**: User logs in → JWT generated with fingerprint
2. **Storage**: Tokens stored in secure httpOnly cookies
3. **Validation**: Each request validates signature and fingerprint
4. **Rotation**: At 80% lifetime, new tokens generated automatically
5. **Expiration**: Access token expires in 1 hour, refresh in 7 days
6. **Revocation**: Tokens can be blacklisted immediately

## Best Practices

1. **Key Security**:
   - Never commit JWT keys to repository
   - Use different keys for each environment
   - Rotate keys periodically

2. **Token Handling**:
   - Always use HTTPS in production
   - Include CSRF tokens for state-changing operations
   - Validate tokens on every request

3. **Error Handling**:
   - Don't expose token validation errors to users
   - Log security events for monitoring
   - Implement rate limiting on auth endpoints

## Next Steps

- Phase 1.3: Implement Web Crypto API for encryption
- Phase 2.1: Update all apps to use new auth system
- Phase 2.2: Add Redis for session management