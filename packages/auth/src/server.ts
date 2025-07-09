// Server-side only exports for Node.js environments
export { AuthServer } from './server/auth-server'

// Server service exports (for API routes)
export { EmailService, createEmailService } from './server/email-service'
export { WhatsAppService, createWhatsAppService } from './server/whatsapp-service'

// Cookie and CSRF exports
export { createCookieHandler, cookieMiddleware, withCookies } from './server/cookie-handler'
export type { CookieHandler, ServerCookieOptions } from './server/cookie-handler'
export { csrfProtection, withCsrfProtection, getCsrfToken } from './server/csrf-middleware'
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

// Core types needed for server-side operations
export type {
  User,
  AuthSession,
  AuthConfig,
  AuthError,
  LoginCredentials,
  RegistrationData,
  PasswordResetData,
  AuthProvider,
  OAuthConfig
} from './types'

// Auth service for server-side operations
export { AuthService } from './core/auth-service'
export { createAuthConfig, validateAuthConfig } from './utils/config'