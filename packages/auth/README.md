# @sasarjan/auth

Shared authentication package for the SaSarjan App Store platform. Provides centralized authentication with Single Sign-On (SSO) capabilities across all apps.

## Features

- 🔐 **Single Sign-On (SSO)** - Login once, access all apps
- 🔄 **Shared State Management** - Synchronized auth state across apps
- 🛡️ **Secure by Default** - PKCE flow, HTTP-only cookies, proper CSRF protection
- 📱 **Cross-App Communication** - Seamless session sharing between apps
- 🎯 **TypeScript First** - Full type safety and excellent DX
- ⚡ **Performance Optimized** - Minimal bundle size, efficient state updates

## Installation

```bash
pnpm add @sasarjan/auth
```

## Basic Usage

### Client-Side

```typescript
import { AuthService, useAuth, useAuthActions } from '@sasarjan/auth'

// Initialize auth service
const authService = new AuthService({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  redirectUrl: 'http://localhost:3000'
})

// In your React component
function LoginForm() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { setSession, setLoading, setError } = useAuthActions()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const session = await authService.signIn({ email, password })
      setSession(session)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <div>Welcome, {user?.full_name}!</div>
  }

  return <LoginForm onSubmit={handleLogin} />
}
```

### Server-Side

```typescript
import { AuthServer } from '@sasarjan/auth/server'

const authServer = new AuthServer({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  jwtSecret: process.env.JWT_SECRET!
})

// In your API route
export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await authServer.verifyToken(token)

  if (!user) {
    return new Response('Invalid token', { status: 401 })
  }

  return Response.json({ user })
}
```

## Cross-App Authentication

The package automatically synchronizes authentication state across all apps in the same domain:

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

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret

# Optional
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
```

### Advanced Configuration

```typescript
import { createAuthConfig } from '@sasarjan/auth'

const config = createAuthConfig({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  redirectUrl: 'http://localhost:3000/auth/callback',
  storageKey: 'my-app-auth',
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true
})
```

## API Reference

### AuthService

Core authentication service for client-side operations.

#### Methods

- `getSession(): Promise<AuthSession | null>`
- `getUser(): Promise<User | null>`
- `signIn(credentials: LoginCredentials): Promise<AuthSession>`
- `signUp(data: RegistrationData): Promise<AuthSession | null>`
- `signInWithOAuth(config: OAuthConfig): Promise<void>`
- `signOut(): Promise<void>`
- `resetPassword(data: PasswordResetData): Promise<void>`
- `refreshSession(): Promise<AuthSession>`

### AuthServer

Server-side authentication utilities.

#### Methods

- `verifyToken(token: string): Promise<User | null>`
- `createToken(user: User): Promise<string>`
- `getUserById(userId: string): Promise<User | null>`
- `validateSession(token: string): Promise<{user: User, session: AuthSession} | null>`

### Hooks

- `useAuth()` - Get current auth state
- `useAuthActions()` - Get auth actions and event system

## Security Considerations

- Uses PKCE flow for OAuth
- HTTP-only cookies for sensitive tokens
- Automatic token refresh
- Cross-app communication uses secure postMessage
- All tokens are validated server-side
- Built-in CSRF protection

## Contributing

See the main project README for contribution guidelines.

## License

MIT
