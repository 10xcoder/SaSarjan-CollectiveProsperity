# Auth Package Implementation Guide

This guide walks through implementing the @sasarjan/auth package across all apps in the SaSarjan ecosystem.

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [App Configuration](#app-configuration)
3. [Authentication Pages](#authentication-pages)
4. [Protected Routes](#protected-routes)
5. [API Protection](#api-protection)
6. [Cross-App SSO](#cross-app-sso)
7. [Testing](#testing)

## Environment Setup

### 1. Generate Security Keys

Run the provided script to generate secure keys:

```bash
./scripts/generate-auth-keys.sh
```

### 2. Create .env.local

Copy `.env.local.example` to `.env.local` in each app and add:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security Keys (from generate-auth-keys.sh)
HMAC_SECRET_KEY=your-generated-hmac-key
TOKEN_ENCRYPTION_KEY=your-generated-token-key
JWT_SECRET=your-generated-jwt-secret

# Cookie Domain
NEXT_PUBLIC_COOKIE_DOMAIN=.localhost # for local dev
# NEXT_PUBLIC_COOKIE_DOMAIN=.yourdomain.com # for production

# App URLs
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3004
# ... other app URLs
```

## App Configuration

### 1. Update Providers

Each app needs to use `UnifiedAuthProvider` with secure settings:

```typescript
// app/providers.tsx
import { UnifiedAuthProvider } from '@sasarjan/auth/client'

export function Providers({ children }) {
  const authConfig = {
    appId: 'your-app-id', // unique for each app
    appName: 'Your App Name',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    
    // Enable security features
    useSecureTokens: true,
    enableSecureCrossAppSync: true,
    hmacSecret: process.env.HMAC_SECRET_KEY,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    
    // Session settings
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    activityTimeout: 30 * 60 * 1000, // 30 minutes
    
    // Supabase
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }

  return (
    <UnifiedAuthProvider config={authConfig}>
      {/* Your other providers */}
      {children}
    </UnifiedAuthProvider>
  )
}
```

### 2. App IDs

Use these standard app IDs:
- `sasarjan-web` - Main web app
- `sasarjan-admin` - Admin dashboard
- `talentexcel` - TalentExcel app
- `sevapremi` - SevaPremI app
- `10xgrowth` - 10xGrowth app

## Authentication Pages

### 1. Login Page

```typescript
// app/auth/login/page.tsx
import { LoginForm } from '@sasarjan/auth/client'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1>Welcome Back</h1>
        
        <LoginForm 
          onSuccess={() => router.push('/dashboard')}
          showSignUp={false}
          className="bg-white rounded-lg shadow p-6"
        />
        
        <Link href="/auth/register">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  )
}
```

### 2. Register Page

```typescript
// app/auth/register/page.tsx
import { LoginForm } from '@sasarjan/auth/client'

export default function RegisterPage() {
  return (
    <LoginForm 
      onSuccess={() => router.push('/dashboard')}
      showSignUp={true} // This enables sign-up mode
    />
  )
}
```

### 3. Using Auth Hook

```typescript
import { useAuth } from '@sasarjan/auth/client'

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    signIn,
    signOut,
    getAccessToken,
    getCsrfToken
  } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <button onClick={() => signIn(email, password)}>Login</button>
  }
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

## Protected Routes

### 1. Component Protection

```typescript
import { ProtectedRoute } from '@sasarjan/auth/client'

export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <h1>Protected Dashboard</h1>
      {/* Your protected content */}
    </ProtectedRoute>
  )
}
```

### 2. Middleware Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check auth cookies
  const isAuthenticated = !!(
    request.cookies.get('sasarjan-auth-access') ||
    request.cookies.get('sasarjan-session')
  )
  
  // Protect routes
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}
```

## API Protection

### 1. Protected API Routes

```typescript
// app/api/protected/route.ts
import { jwtProtection, getRequestUser } from '@sasarjan/auth/server'

export const GET = jwtProtection(async (req) => {
  const user = await getRequestUser(req)
  
  return NextResponse.json({
    message: 'Protected data',
    userId: user.id
  })
})
```

### 2. CSRF Protection

```typescript
// app/api/form-submit/route.ts
import { csrfProtection } from '@sasarjan/auth/server'

export const POST = csrfProtection(async (req) => {
  const data = await req.json()
  
  // Process form data safely
  return NextResponse.json({ success: true })
})
```

### 3. Role-Based Access

```typescript
import { requireRoles } from '@sasarjan/auth/server'

export const POST = requireRoles(['admin', 'moderator'])(async (req) => {
  // Only admins and moderators can access
  return NextResponse.json({ message: 'Admin action completed' })
})
```

## Cross-App SSO

### 1. Enable Secure Sync

All apps must use the same HMAC secret:

```typescript
const authConfig = {
  enableSecureCrossAppSync: true,
  hmacSecret: process.env.HMAC_SECRET_KEY, // Same across all apps
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN // e.g., ".yourdomain.com"
}
```

### 2. Listen for Auth Events

```typescript
import { useAuthActions } from '@sasarjan/auth'

function App() {
  const { addEventListener } = useAuthActions()
  
  useEffect(() => {
    const unsubscribe = addEventListener((event) => {
      switch (event.type) {
        case 'SIGN_IN':
          console.log('User signed in from another app')
          break
        case 'SIGN_OUT':
          console.log('User signed out from another app')
          break
      }
    })
    
    return unsubscribe
  }, [])
}
```

## Testing

### 1. Test Individual App Auth

```bash
# Start each app
pnpm dev --filter=web
pnpm dev --filter=admin

# Test login/logout in each app
```

### 2. Test Cross-App SSO

1. Open multiple apps in different tabs
2. Sign in to one app
3. Verify automatic sign-in in other apps
4. Sign out from one app
5. Verify automatic sign-out in other apps

### 3. Test Security Features

```bash
# Check cookies in browser DevTools
# Should see:
# - sasarjan-auth-access (httpOnly, secure, sameSite)
# - sasarjan-auth-refresh (httpOnly, secure, sameSite)
# - sasarjan-auth-csrf (for CSRF protection)

# Test token rotation
# Tokens should automatically refresh before expiry
```

### 4. Verify HMAC Signing

Check browser console for cross-app sync messages:
```
✓ HMAC signature verified from app: sasarjan-web
✓ Session synchronized across apps
```

## Troubleshooting

### Common Issues

1. **Cross-app sync not working**
   - Ensure all apps use the same HMAC_SECRET_KEY
   - Check NEXT_PUBLIC_COOKIE_DOMAIN is set correctly
   - Verify apps are on same domain/subdomain

2. **Cookies not being set**
   - For local dev, use `.localhost` as cookie domain
   - Ensure HTTPS in production
   - Check SameSite settings

3. **Token rotation failing**
   - Verify TOKEN_ENCRYPTION_KEY is set
   - Check session timeout settings
   - Ensure refresh endpoint is accessible

4. **CSRF errors**
   - Verify CSRF token is included in requests
   - Check cookie settings
   - Ensure same-origin requests

## Migration Checklist

- [ ] Generate security keys
- [ ] Update .env.local in all apps
- [ ] Update providers.tsx to use UnifiedAuthProvider
- [ ] Replace custom auth with package components
- [ ] Update API routes to use JWT protection
- [ ] Configure middleware for route protection
- [ ] Test individual app authentication
- [ ] Test cross-app SSO
- [ ] Deploy with coordinated release

## Security Best Practices

1. **Environment Variables**
   - Never commit .env.local files
   - Use different keys for dev/staging/prod
   - Rotate keys periodically

2. **Session Management**
   - Use appropriate timeouts
   - Implement activity-based refresh
   - Clear sessions on logout

3. **API Security**
   - Always validate tokens server-side
   - Use CSRF protection for mutations
   - Implement rate limiting (future)

4. **Monitoring**
   - Log auth events
   - Monitor failed attempts
   - Track cross-app sync issues