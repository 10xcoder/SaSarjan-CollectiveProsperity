import { 
  generateTokenPair, 
  verifyToken, 
  rotateTokens, 
  revokeToken,
  hashFingerprint,
  validateTokenClaims,
  type TokenPair,
  type TokenPayload,
  type DeviceFingerprint,
  type JWTConfig
} from '../utils/jwt'
import { nanoid } from 'nanoid'
import { createSecureCookieStorage, type SecureCookieStorage } from '../utils/cookie-storage'
import type { User, AuthSession } from '../types'

export interface SecureTokenServiceConfig {
  algorithm?: 'RS256' | 'ES256'
  issuer?: string
  audience?: string
  expiresIn?: string
  privateKey?: string
  publicKey?: string
  cookieDomain?: string
  secureCookies?: boolean
  tokenRotationThreshold?: number // Percentage of token lifetime (0-1)
  enableFingerprinting?: boolean
  maxRefreshTokenAge?: number // Days
}

export class SecureTokenService {
  private config: Required<SecureTokenServiceConfig>
  private cookieStorage: SecureCookieStorage
  private rotationTimers: Map<string, NodeJS.Timeout>
  private fingerprintCache: Map<string, string>
  
  constructor(config: SecureTokenServiceConfig = {}) {
    this.config = {
      algorithm: config.algorithm || 'RS256',
      issuer: config.issuer || 'sasarjan-auth',
      audience: config.audience || 'sasarjan-apps',
      expiresIn: config.expiresIn || '1h',
      privateKey: config.privateKey || '',
      publicKey: config.publicKey || '',
      cookieDomain: config.cookieDomain || '',
      secureCookies: config.secureCookies ?? true,
      tokenRotationThreshold: config.tokenRotationThreshold || 0.8,
      enableFingerprinting: config.enableFingerprinting ?? true,
      maxRefreshTokenAge: config.maxRefreshTokenAge || 30
    }
    
    this.cookieStorage = createSecureCookieStorage('sasarjan-auth', {
      domain: this.config.cookieDomain || undefined,
      secure: this.config.secureCookies
    })
    
    this.rotationTimers = new Map()
    this.fingerprintCache = new Map()
  }
  
  async createSession(
    user: User,
    deviceFingerprint?: DeviceFingerprint,
    metadata?: Record<string, any>
  ): Promise<AuthSession> {
    // Hash device fingerprint if provided
    const fingerprintHash = deviceFingerprint && this.config.enableFingerprinting
      ? hashFingerprint(deviceFingerprint)
      : undefined
    
    // Generate secure token pair
    const tokenPair = await generateTokenPair(user.id, {
      email: user.email,
      fingerprint: fingerprintHash,
      roles: [user.role], // Use the role from User type
      permissions: [], // Will need to be fetched from a separate permissions system
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    }, this.config)
    
    // Store tokens in secure cookies
    this.storeTokens(tokenPair, user.id)
    
    // Schedule automatic rotation
    if (this.config.tokenRotationThreshold > 0) {
      this.scheduleTokenRotation(user.id, tokenPair.expiresIn)
    }
    
    // Cache fingerprint for validation
    if (fingerprintHash) {
      this.fingerprintCache.set(user.id, fingerprintHash)
    }
    
    return {
      id: nanoid(), // Generate session ID
      access_token: tokenPair.accessToken,
      refresh_token: tokenPair.refreshToken,
      expires_in: tokenPair.expiresIn,
      expires_at: Math.floor(Date.now() / 1000) + tokenPair.expiresIn,
      user
    }
  }
  
  async validateSession(
    accessToken: string,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<TokenPayload> {
    try {
      // Verify token signature and claims
      const payload = await verifyToken(accessToken, this.config)
      
      // Validate standard claims
      validateTokenClaims(payload)
      
      // Validate device fingerprint if enabled
      if (this.config.enableFingerprinting && deviceFingerprint) {
        const expectedFingerprint = this.fingerprintCache.get(payload.sub)
        const actualFingerprint = hashFingerprint(deviceFingerprint)
        
        if (expectedFingerprint && expectedFingerprint !== actualFingerprint) {
          throw new Error('Device fingerprint mismatch')
        }
        
        // Also check against token payload
        if (payload.fingerprint && payload.fingerprint !== actualFingerprint) {
          throw new Error('Token fingerprint mismatch')
        }
      }
      
      return payload
    } catch (error) {
      // Log security event
      console.error('Session validation failed:', error)
      throw error
    }
  }
  
  async refreshSession(
    refreshToken: string,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<TokenPair> {
    try {
      // Calculate fingerprint hash
      const fingerprintHash = deviceFingerprint && this.config.enableFingerprinting
        ? hashFingerprint(deviceFingerprint)
        : ''
      
      // Rotate tokens with fingerprint validation
      const newTokenPair = await rotateTokens(refreshToken, fingerprintHash, this.config)
      
      // Get user ID from refresh token
      const payload = await verifyToken(refreshToken, this.config)
      
      // Store new tokens
      this.storeTokens(newTokenPair, payload.sub)
      
      // Schedule rotation for new token
      if (this.config.tokenRotationThreshold > 0) {
        this.scheduleTokenRotation(payload.sub, newTokenPair.expiresIn)
      }
      
      return newTokenPair
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error
    }
  }
  
  async revokeSession(userId: string, tokenId?: string): Promise<void> {
    // Cancel any scheduled rotations
    const timer = this.rotationTimers.get(userId)
    if (timer) {
      clearTimeout(timer)
      this.rotationTimers.delete(userId)
    }
    
    // Clear stored tokens
    this.cookieStorage.removeItem(`access-${userId}`)
    this.cookieStorage.removeItem(`refresh-${userId}`)
    
    // Remove fingerprint cache
    this.fingerprintCache.delete(userId)
    
    // Add token to blacklist if ID provided
    if (tokenId) {
      revokeToken(tokenId)
    }
  }
  
  private storeTokens(tokenPair: TokenPair, userId: string): void {
    // Store access token
    this.cookieStorage.setItem(`access-${userId}`, tokenPair.accessToken, {
      maxAge: tokenPair.expiresIn,
      httpOnly: true,
      secure: this.config.secureCookies,
      sameSite: 'strict'
    })
    
    // Store refresh token with longer expiry
    const refreshMaxAge = this.config.maxRefreshTokenAge * 24 * 60 * 60 // Convert days to seconds
    this.cookieStorage.setItem(`refresh-${userId}`, tokenPair.refreshToken, {
      maxAge: refreshMaxAge,
      httpOnly: true,
      secure: this.config.secureCookies,
      sameSite: 'strict',
      path: '/api/auth/refresh' // Restrict refresh token to specific endpoint
    })
  }
  
  private scheduleTokenRotation(userId: string, expiresIn: number): void {
    // Clear existing timer
    const existingTimer = this.rotationTimers.get(userId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // Schedule rotation at threshold percentage of token lifetime
    const rotationTime = expiresIn * this.config.tokenRotationThreshold * 1000
    
    const timer = setTimeout(async () => {
      try {
        // Get refresh token
        const refreshToken = this.cookieStorage.getItem(`refresh-${userId}`)
        if (!refreshToken) return
        
        // Get cached fingerprint
        const fingerprint = this.fingerprintCache.get(userId)
        
        // Perform rotation
        await this.refreshSession(refreshToken, fingerprint ? {
          userAgent: '',
          screenResolution: '',
          timezone: '',
          language: '',
          colorDepth: 0,
          platform: ''
        } : undefined)
        
        console.log(`Token rotated for user: ${userId}`)
      } catch (error) {
        console.error(`Failed to rotate token for user ${userId}:`, error)
      }
    }, rotationTime)
    
    this.rotationTimers.set(userId, timer)
  }
  
  getStoredTokens(userId: string): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.cookieStorage.getItem(`access-${userId}`),
      refreshToken: this.cookieStorage.getItem(`refresh-${userId}`)
    }
  }
  
  getCsrfToken(): string {
    return this.cookieStorage.getCsrfToken()
  }
  
  validateCsrfToken(token: string): boolean {
    return this.cookieStorage.validateCsrfToken(token)
  }
  
  destroy(): void {
    // Clear all timers
    this.rotationTimers.forEach(timer => clearTimeout(timer))
    this.rotationTimers.clear()
    
    // Clear caches
    this.fingerprintCache.clear()
  }
}

// Singleton instance
let secureTokenService: SecureTokenService | null = null

export function getSecureTokenService(config?: SecureTokenServiceConfig): SecureTokenService {
  if (!secureTokenService) {
    secureTokenService = new SecureTokenService(config)
  }
  return secureTokenService
}

export function destroySecureTokenService(): void {
  if (secureTokenService) {
    secureTokenService.destroy()
    secureTokenService = null
  }
}