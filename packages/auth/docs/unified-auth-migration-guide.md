# Unified Auth Implementation Migration Guide

## Overview
This guide helps you migrate all SaSarjan apps to use the new secure authentication system with JWT tokens, secure cookies, CSRF protection, and cross-app synchronization.

## Quick Start (5 minutes)

### 1. Update Environment Variables

Add to your app's `.env.local`:
```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Keys (new - generate with: pnpm -F @sasarjan/auth generate-keys)
JWT_PRIVATE_KEY=your-private-key
JWT_PUBLIC_KEY=your-public-key

# Security (new)
COOKIE_SECRET=generate-strong-random-string
MASTER_ENCRYPTION_KEY=generate-256-bit-key

# Optional
NEXT_PUBLIC_COOKIE_DOMAIN=.sasarjan.com  # For production only
```

### 2. Wrap Your App with AuthWrapper

Update your app's `providers.tsx` or `layout.tsx`:

```typescript
import { AuthWrapper } from '@sasarjan/auth/client-only'

export function Providers({ children }) {
  return (
    <AuthWrapper
      appId="your-app-id"        // e.g., "talentexcel"
      appName="Your App Name"    // e.g., "TalentExcel"
      enableCrossAppSync={true}
    >
      {/* Your other providers */}
      {children}
    </AuthWrapper>
  )
}
```

### 3. Use Auth Hooks

```typescript
import { useAuth, useUser, ProtectedRoute } from '@sasarjan/auth/client-only'

function MyComponent() {
  const { signIn, signOut, isAuthenticated } = useAuth()
  const user = useUser()
  
  return (
    <ProtectedRoute redirectTo="/login">
      <div>Welcome {user?.email}!</div>
    </ProtectedRoute>
  )
}
```

### 4. Add Middleware (Next.js)

Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/api/auth/login', '/api/auth/register']
const protectedRoutes = ['/dashboard', '/profile', '/api/user']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  const authToken = request.cookies.get('sasarjan-auth-access')
  
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

## Detailed Migration Steps

### Step 1: Install/Update Auth Package

```bash
pnpm add @sasarjan/auth@latest
```

### Step 2: Generate JWT Keys

```bash
pnpm -F @sasarjan/auth generate-keys
```

This creates an `.env.example` file with your keys. Copy them to your app's `.env.local`.

### Step 3: Update API Routes

#### Before (Direct Supabase):
```typescript
// ❌ Old way
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(...)
  const { data, error } = await supabase.auth.signInWithPassword(...)
}
```

#### After (Secure Auth):
```typescript
// ✅ New way
import { withJWTAuth, withCsrfProtection } from '@sasarjan/auth'

export const POST = withCsrfProtection(withJWTAuth(
  async (req: Request) => {
    // Automatically validated JWT + CSRF
    const user = getRequestUser(req)
    // Your logic here
  }
))
```

### Step 4: Update Client Components

#### Before:
```typescript
// ❌ Old way
const [user, setUser] = useState(null)

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user)
  })
}, [])
```

#### After:
```typescript
// ✅ New way
import { useAuth, useUser } from '@sasarjan/auth/client-only'

function Component() {
  const user = useUser() // Automatically synced
  const { signIn, signOut } = useAuth()
  
  // No manual state management needed!
}
```

### Step 5: Protected Routes

```typescript
import { ProtectedRoute } from '@sasarjan/auth/client-only'

// Protect entire page
export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <Dashboard />
    </ProtectedRoute>
  )
}

// Or with custom fallback
<ProtectedRoute fallback={<LoadingSpinner />}>
  <SecureContent />
</ProtectedRoute>
```

### Step 6: API Authentication

```typescript
import { useAuthHeaders, useCsrfFetch } from '@sasarjan/auth/client-only'

function ApiComponent() {
  // Option 1: Use auth headers
  const headers = useAuthHeaders()
  
  const fetchData = async () => {
    const res = await fetch('/api/data', { headers })
  }
  
  // Option 2: Use CSRF-protected fetch
  const csrfFetch = useCsrfFetch()
  
  const postData = async () => {
    const res = await csrfFetch('/api/data', {
      method: 'POST',
      body: JSON.stringify({ data })
    })
  }
}
```

## App-Specific Examples

### Web App (Main Platform)
```typescript
// apps/web/src/app/providers.tsx
<AuthWrapper
  appId="sasarjan-web"
  appName="SaSarjan Web"
  enableCrossAppSync={true}
>
```

### Admin Dashboard
```typescript
// apps/admin/src/app/providers.tsx
<AuthWrapper
  appId="sasarjan-admin"
  appName="SaSarjan Admin"
  enableCrossAppSync={true}
>

// Protect admin routes
import { requireRoles } from '@sasarjan/auth'

export const GET = withJWTAuth(async (req) => {
  requireRoles(['admin'])(req, res)
  // Admin-only logic
})
```

### TalentExcel
```typescript
// apps/talentexcel/src/app/providers.tsx
<AuthWrapper
  appId="talentexcel"
  appName="TalentExcel"
  enableCrossAppSync={true}
>
```

### SevaPremi
```typescript
// apps/sevapremi/src/app/providers.tsx
<AuthWrapper
  appId="sevapremi"
  appName="SevaPremi"
  enableCrossAppSync={true}
>
```

### 10x Growth
```typescript
// apps/10xgrowth/src/app/providers.tsx
<AuthWrapper
  appId="10xgrowth"
  appName="10x Growth"
  enableCrossAppSync={true}
>
```

## Security Features Enabled

### 1. Secure Cookies
- httpOnly: Prevents XSS attacks
- secure: HTTPS only in production
- sameSite: CSRF protection
- Automatic expiration

### 2. JWT Tokens
- RS256 signed tokens
- Device fingerprint binding
- Automatic rotation at 80% lifetime
- Revocation support

### 3. CSRF Protection
- Double-submit cookie pattern
- Automatic token generation
- Required for state-changing operations

### 4. Encryption
- AES-256-GCM for sensitive data
- PBKDF2 key derivation
- Secure storage for tokens

### 5. Cross-App Sync
- Single sign-on across all apps
- Real-time auth state sync
- Secure message passing

## Testing Your Migration

### 1. Check Auth State
```typescript
// Add to any component
const { isAuthenticated, user, session } = useAuth()
console.log('Auth state:', { isAuthenticated, user, session })
```

### 2. Verify Cookies
1. Open DevTools > Application > Cookies
2. Look for:
   - `sasarjan-auth-access` (httpOnly)
   - `sasarjan-auth-refresh` (httpOnly)
   - `sasarjan-csrf-token` (accessible to JS)

### 3. Test Cross-App Sync
1. Sign in to one app
2. Open another app in a new tab
3. Should be automatically signed in

### 4. Test Token Rotation
1. Set `JWT_ACCESS_TOKEN_EXPIRY=2m` for testing
2. Wait ~90 seconds
3. Make an API call
4. Should auto-refresh without user interaction

## Troubleshooting

### "Missing Supabase configuration"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### "Invalid CSRF token"
- Check that cookies are enabled
- Ensure you're using `useCsrfFetch` or including the token

### "JWT verification failed"
- Verify JWT keys are correctly set
- Check token hasn't expired
- Ensure same keys across services

### Cross-app sync not working
- Check `enableCrossAppSync={true}`
- Verify apps are on same domain (production)
- Check browser console for errors

## Migration Checklist

- [ ] Update environment variables
- [ ] Generate JWT keys
- [ ] Wrap app with AuthWrapper
- [ ] Update API routes to use JWT middleware
- [ ] Replace Supabase auth calls with useAuth
- [ ] Add middleware.ts for route protection
- [ ] Test sign in/out flow
- [ ] Verify cookies are set correctly
- [ ] Test protected routes
- [ ] Check cross-app synchronization
- [ ] Update error handling

## Best Practices

1. **Never expose JWT private key**
   - Keep in server-side env only
   - Rotate keys periodically

2. **Use ProtectedRoute component**
   - Don't manually check auth state
   - Handles loading states automatically

3. **Include CSRF token**
   - Use `useCsrfFetch` for mutations
   - Or manually include from `useCsrfToken()`

4. **Handle token expiry**
   - Auth automatically refreshes
   - Show UI feedback during refresh

5. **Log security events**
   - Monitor failed logins
   - Track suspicious activity

## Support

- Check `/packages/auth/docs/` for detailed guides
- Review example implementations in `/apps/web/`
- File issues at the project repository