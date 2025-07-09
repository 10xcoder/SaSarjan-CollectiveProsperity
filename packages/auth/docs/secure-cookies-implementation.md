# Secure Cookie Implementation Guide

## Overview
We've successfully implemented secure cookie-based authentication to replace localStorage, providing better security for token storage with CSRF protection.

## New Features

### 1. Secure Cookie Storage (`cookie-storage.ts`)
- **httpOnly cookies**: Prevents XSS attacks by making cookies inaccessible to JavaScript
- **Secure flag**: Ensures cookies are only sent over HTTPS in production
- **SameSite protection**: Prevents CSRF attacks by restricting cross-site cookie usage
- **Automatic migration**: Seamlessly moves existing localStorage tokens to cookies

### 2. Server-Side Cookie Handler (`cookie-handler.ts`)
- **Signed cookies**: HMAC-based signatures prevent tampering
- **Cookie parsing/serialization**: Robust handling of HTTP cookies
- **CSRF token generation**: Secure random token generation
- **Middleware support**: Easy integration with Express/Next.js

### 3. CSRF Protection (`csrf-middleware.ts`)
- **Double-submit cookie pattern**: Validates CSRF tokens on state-changing requests
- **Automatic token management**: Generates and validates tokens transparently
- **Flexible integration**: Works with Express middleware or Next.js API routes
- **Safe method exemption**: GET, HEAD, OPTIONS requests don't require CSRF tokens

### 4. Enhanced Token Manager
- **Cookie-first approach**: Uses secure cookies by default
- **Backward compatibility**: Can still use localStorage if needed
- **CSRF token integration**: Automatically includes CSRF tokens in auth headers
- **Migration support**: Seamlessly moves existing tokens to cookies

## Usage Examples

### Client-Side Usage

```typescript
import { getTokenManager } from '@sasarjan/auth'
import { useCsrfToken, useCsrfFetch } from '@sasarjan/auth/client-only'

// Initialize token manager with cookies (default)
const tokenManager = getTokenManager({
  useCookies: true, // Default is true
  cookieDomain: '.sasarjan.com' // Optional: for cross-subdomain auth
})

// React component with CSRF protection
function MyComponent() {
  const { csrfToken } = useCsrfToken()
  const csrfFetch = useCsrfFetch()
  
  const handleSubmit = async () => {
    // csrfFetch automatically includes CSRF token
    const response = await csrfFetch('/api/protected', {
      method: 'POST',
      body: JSON.stringify({ data: 'example' })
    })
  }
}
```

### Server-Side Usage (Next.js)

```typescript
import { withCookies, withCsrfProtection } from '@sasarjan/auth'

// Basic cookie handling
export default withCookies(async (req, res) => {
  // req.cookies is now available
  const token = req.cookies.get('sasarjan-tokens-access')
  const csrfToken = req.cookies.getCsrfToken()
  
  res.json({ csrfToken })
})

// With CSRF protection
export default withCsrfProtection(async (req, res) => {
  // CSRF token is automatically validated for POST/PUT/DELETE
  // Safe methods (GET) don't require validation
  
  res.json({ success: true })
})
```

### Express Middleware

```typescript
import { cookieMiddleware, csrfProtection } from '@sasarjan/auth'

// Apply to all routes
app.use(cookieMiddleware())
app.use(csrfProtection({
  excludePaths: ['/api/auth/login', '/api/auth/register']
}))

// Access in route handlers
app.post('/api/protected', (req, res) => {
  const token = req.cookies.get('auth-token')
  const isValid = req.cookies.validateCsrfToken(req.body._csrf)
  
  res.json({ success: true })
})
```

## Security Benefits

1. **XSS Protection**: httpOnly cookies can't be accessed by JavaScript, preventing token theft
2. **CSRF Protection**: Double-submit cookie pattern prevents cross-site request forgery
3. **Man-in-the-Middle**: Secure flag ensures cookies only sent over HTTPS
4. **Cookie Signing**: HMAC signatures prevent cookie tampering
5. **Automatic Token Rotation**: Built-in support for rotating tokens at 80% lifetime

## Migration Guide

### For Existing Apps

1. Update `@sasarjan/auth` package to latest version
2. Tokens will automatically migrate from localStorage to cookies on first load
3. Update API routes to use cookie middleware and CSRF protection
4. Update fetch calls to include credentials: 'include'

### Environment Variables

```env
# Cookie signing secret (required for production)
COOKIE_SECRET=your-strong-secret-key-here

# Optional: Cookie domain for cross-subdomain auth
COOKIE_DOMAIN=.sasarjan.com
```

## Next Steps

- Phase 1.2: Implement JWT signing with RS256/ES256
- Phase 1.3: Replace XOR encryption with Web Crypto API
- Phase 2.1: Update all apps to use the new auth system

## Testing

```bash
# Run auth package tests
cd packages/auth
pnpm test

# Check cookie implementation
pnpm dev
# Open browser DevTools > Application > Cookies
# Verify httpOnly, secure, and sameSite flags
```