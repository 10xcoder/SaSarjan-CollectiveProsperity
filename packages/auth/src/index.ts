// Core exports
export { AuthService } from './core/auth-service'

// Client-side exports
export { useAuthStore, useAuth, useAuthActions } from './client/auth-store'

// Session management exports
export { SessionManager, getSessionManager, destroySessionManager } from './client/session-manager'

// Session security exports
export { SessionSecurityEnhancer, getSessionSecurityEnhancer, destroySessionSecurityEnhancer } from './client/session-security'

// Token management exports
export { TokenManager, getTokenManager, destroyTokenManager } from './client/token-manager'

// Cross-app synchronization exports
export { CrossAppSyncService, createCrossAppSync, SASARJAN_APPS } from './client/cross-app-sync'

// Note: Components and hooks are available in './client-only' export
// This keeps the main export clean for server-side usage

// Server-side exports
export { AuthServer } from './server/auth-server'

// Server service exports (for API routes)
export { EmailService, createEmailService } from './server/email-service'
export { WhatsAppService, createWhatsAppService } from './server/whatsapp-service'

// Type exports
export type {
  User,
  AuthSession,
  AuthState,
  AuthEvent,
  RegisteredApp,
  AuthConfig,
  AuthError,
  LoginCredentials,
  RegistrationData,
  PasswordResetData,
  AuthProvider,
  OAuthConfig,
  CrossAppMessage,
  AuthEventHandler,
  AuthStateSubscriber
} from './types'

// Utility functions
export { createAuthConfig, validateAuthConfig } from './utils/config'
export { createSecureStorage } from './utils/storage'