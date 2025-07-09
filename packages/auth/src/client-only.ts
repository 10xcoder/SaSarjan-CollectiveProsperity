// Client-only exports that require React
export { default as AuthProvider } from './components/auth-provider'
export { LoginForm } from './components/login-form'
export type { LoginFormProps } from './components/login-form'
export { useAuthentication } from './hooks/use-authentication'
export { useCsrfToken, useCsrfFetch } from './client/hooks/use-csrf-token'

// New secure auth components
export { SecureAuthProvider, useSecureAuth, useUser, useSession, useAuthHeaders, ProtectedRoute } from './components/secure-auth-provider'
export type { SecureAuthConfig, SecureAuthProviderProps, ProtectedRouteProps } from './components/secure-auth-provider'

// Unified auth provider - recommended for all apps
export { 
  UnifiedAuthProvider, 
  useUnifiedAuth, 
  useUser as useUnifiedUser,
  useSession as useUnifiedSession,
  ProtectedRoute as UnifiedProtectedRoute 
} from './components/unified-auth-provider'
export type { UnifiedAuthConfig, UnifiedAuthProviderProps } from './components/unified-auth-provider'

// Convenience hooks
export { useAuth, useRequireAuth, useAuthHeaders as useAuthHeadersHook } from './hooks/use-auth'

// Simplified auth wrapper for easy migration
export { AuthWrapper } from './components/auth-wrapper'
export type { AuthWrapperProps } from './components/auth-wrapper'