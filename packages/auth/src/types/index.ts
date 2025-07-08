// Core user types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'customer' | 'developer' | 'admin'
  wallet_balance: number
  kyc_status: 'pending' | 'verified' | 'rejected'
  preferred_language: string
  created_at: string
  updated_at: string
}

// Authentication session
export interface AuthSession {
  id: string
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  provider?: string
  provider_token?: string
  provider_refresh_token?: string
}

// Authentication state
export interface AuthState {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Authentication events for cross-app communication
export type AuthEvent = 
  | { type: 'SIGN_IN'; payload: AuthSession }
  | { type: 'SIGN_OUT'; payload: null }
  | { type: 'TOKEN_REFRESHED'; payload: { access_token: string; expires_at: number } }
  | { type: 'USER_UPDATED'; payload: User }
  | { type: 'SESSION_EXPIRED'; payload: null }

// App registration for cross-app auth
export interface RegisteredApp {
  id: string
  name: string
  origin: string
  permissions: string[]
  trusted: boolean
  created_at: string
}

// Auth configuration
export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  redirectUrl?: string
  storageKey?: string
  autoRefreshToken?: boolean
  persistSession?: boolean
  detectSessionInUrl?: boolean
  sessionTimeout?: number // in milliseconds
  activityTimeout?: number // in milliseconds
  enableTokenEncryption?: boolean
  enableTokenRotation?: boolean
}

// Auth error types
export interface AuthError {
  message: string
  code?: string
  details?: any
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Registration data
export interface RegistrationData {
  email: string
  password: string
  full_name?: string
  metadata?: Record<string, any>
}

// Password reset
export interface PasswordResetData {
  email: string
}

// Auth provider types
export type AuthProvider = 'email' | 'google' | 'github' | 'discord'

// OAuth provider configuration
export interface OAuthConfig {
  provider: AuthProvider
  redirectTo?: string
  scopes?: string
  queryParams?: Record<string, string>
}

// Cross-app message for secure communication
export interface CrossAppMessage {
  type: 'AUTH_REQUEST' | 'AUTH_RESPONSE' | 'AUTH_EVENT'
  appId: string
  sessionId: string
  payload: any
  timestamp: number
  signature?: string
}

export type AuthEventHandler = (event: AuthEvent) => void
export type AuthStateSubscriber = (state: AuthState) => void