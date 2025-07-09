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

// Secure token exports
export { SecureTokenService, getSecureTokenService, destroySecureTokenService } from './core/secure-token-service'
export { SecureTokenManager, getSecureTokenManager, destroySecureTokenManager } from './client/secure-token-manager'
export type { SecureTokenServiceConfig } from './core/secure-token-service'
export type { SecureTokenManagerConfig } from './client/secure-token-manager'

// JWT utilities
export { 
  generateJWTKeyPair, 
  signToken, 
  verifyToken, 
  generateTokenPair,
  rotateTokens,
  revokeToken,
  isTokenRevoked,
  extractBearerToken,
  hashFingerprint,
  validateTokenClaims
} from './utils/jwt'
export type { JWTConfig, TokenPayload, TokenPair as JWTTokenPair, DeviceFingerprint } from './utils/jwt'

// Cross-app synchronization exports
export { CrossAppSyncService, createCrossAppSync, SASARJAN_APPS } from './client/cross-app-sync'

// Secure cross-app sync exports
export { SecureCrossAppSyncService, createSecureCrossAppSync } from './client/secure-cross-app-sync'
export type { SecureCrossAppConfig } from './client/secure-cross-app-sync'

// HMAC and security utilities
export { HMACValidator, getHMACValidator } from './utils/hmac'
export type { HMACConfig, SignedMessage } from './utils/hmac'

// Nonce management
export { NonceManager, getNonceManager, destroyNonceManager } from './utils/nonce-manager'
export type { NonceConfig } from './utils/nonce-manager'

// Key exchange utilities
export { KeyExchange, getKeyExchange } from './utils/key-exchange'
export type { KeyPair, SharedSecret } from './utils/key-exchange'

// Secure messaging
export { SecureMessaging, getSecureMessaging } from './utils/secure-message'
export type { SecureMessageEnvelope, SecureMessageOptions } from './utils/secure-message'

// Note: Components and hooks are available in './client-only' export
// This keeps the main export clean for server-side usage

// Server-side exports
export { AuthServer } from './server/auth-server'

// Server service exports (for API routes)
export { EmailService, createEmailService } from './server/email-service'
export { WhatsAppService, createWhatsAppService } from './server/whatsapp-service'

// Cookie and CSRF exports
export { createCookieHandler, cookieMiddleware, withCookies } from './server/cookie-handler'
export type { CookieHandler, ServerCookieOptions } from './server/cookie-handler'
export { csrfProtection, withCsrfProtection, getCsrfToken, useCsrfToken } from './server/csrf-middleware'
export type { CsrfOptions } from './server/csrf-middleware'

// JWT middleware exports
export { jwtProtection, withJWTAuth, getRequestUser, requireRoles, requirePermissions } from './server/jwt-middleware'
export type { JWTMiddlewareOptions } from './server/jwt-middleware'

// Server-side encryption (Node.js)
export { 
  encryptNode, 
  decryptNode, 
  hashNode, 
  hmacNode, 
  verifyHmacNode,
  generateEncryptionKeyNode,
  generateSecureRandomNode,
  secureCompareNode,
  keyManager,
  isNodeCrypto
} from './server/crypto-node'
export type { NodeEncryptedData, NodeEncryptionConfig } from './server/crypto-node'

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
export { createSecureCookieStorage, migrateFromLocalStorage } from './utils/cookie-storage'
export type { SecureCookieStorage, CookieOptions } from './utils/cookie-storage'

// Encryption utilities
export { 
  encrypt, 
  decrypt, 
  hash, 
  hmac, 
  verifyHmac,
  generateEncryptionKey,
  generateSecureRandom,
  secureCompare,
  isCryptoAvailable
} from './utils/crypto'
export type { EncryptedData, EncryptionConfig } from './utils/crypto'

// Secure storage
export { createSecureStorage as createEncryptedStorage, getSecureStorage, destroySecureStorage } from './utils/secure-storage'
export type { SecureStorage, SecureStorageConfig, SecureStorageItem } from './utils/secure-storage'

// Encrypted token manager
export { EncryptedTokenManager, getEncryptedTokenManager, destroyEncryptedTokenManager } from './client/encrypted-token-manager'
export type { EncryptedTokenManagerConfig } from './client/encrypted-token-manager'