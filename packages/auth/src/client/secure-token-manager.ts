import { getSecureTokenService, type SecureTokenService } from '../core/secure-token-service'
import { verifyToken, extractBearerToken, type TokenPayload, type DeviceFingerprint } from '../utils/jwt'
import { createSecureCookieStorage, type SecureCookieStorage } from '../utils/cookie-storage'
import type { AuthSession, User } from '../types'

export interface SecureTokenManagerConfig {
  enableFingerprinting?: boolean
  autoRotation?: boolean
  cookieDomain?: string
  jwtConfig?: {
    algorithm?: 'RS256' | 'ES256'
    issuer?: string
    audience?: string
  }
}

export class SecureTokenManager {
  private tokenService: SecureTokenService
  private cookieStorage: SecureCookieStorage
  private config: Required<SecureTokenManagerConfig>
  private currentUser: User | null = null
  private deviceFingerprint: DeviceFingerprint | null = null
  
  constructor(config: SecureTokenManagerConfig = {}) {
    this.config = {
      enableFingerprinting: config.enableFingerprinting ?? true,
      autoRotation: config.autoRotation ?? true,
      cookieDomain: config.cookieDomain || '',
      jwtConfig: {
        algorithm: config.jwtConfig?.algorithm || 'RS256',
        issuer: config.jwtConfig?.issuer || 'sasarjan-auth',
        audience: config.jwtConfig?.audience || 'sasarjan-apps'
      }
    }
    
    this.tokenService = getSecureTokenService({
      ...this.config.jwtConfig,
      cookieDomain: this.config.cookieDomain,
      enableFingerprinting: this.config.enableFingerprinting,
      tokenRotationThreshold: this.config.autoRotation ? 0.8 : 0
    })
    
    this.cookieStorage = createSecureCookieStorage('sasarjan-auth', {
      domain: this.config.cookieDomain
    })
    
    // Collect device fingerprint on initialization
    if (this.config.enableFingerprinting && typeof window !== 'undefined') {
      this.collectDeviceFingerprint()
    }
  }
  
  private collectDeviceFingerprint(): void {
    if (typeof window === 'undefined') return
    
    try {
      // Collect WebGL renderer info
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      let webglRenderer = ''
      
      if (gl && gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
      }
      
      this.deviceFingerprint = {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        colorDepth: screen.colorDepth,
        platform: navigator.platform,
        webglRenderer
      }
    } catch (error) {
      console.warn('Failed to collect device fingerprint:', error)
    }
  }
  
  async createSession(user: User, metadata?: Record<string, any>): Promise<AuthSession> {
    const session = await this.tokenService.createSession(
      user,
      this.deviceFingerprint || undefined,
      metadata
    )
    
    this.currentUser = user
    
    // Store user info separately for quick access
    this.cookieStorage.setItem('user', JSON.stringify(user), {
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    return session
  }
  
  async validateCurrentSession(): Promise<TokenPayload | null> {
    try {
      const { accessToken } = this.getStoredTokens()
      if (!accessToken) return null
      
      const payload = await this.tokenService.validateSession(
        accessToken,
        this.deviceFingerprint || undefined
      )
      
      return payload
    } catch (error) {
      console.error('Session validation failed:', error)
      return null
    }
  }
  
  async refreshSession(): Promise<boolean> {
    try {
      const { refreshToken } = this.getStoredTokens()
      if (!refreshToken) return false
      
      await this.tokenService.refreshSession(
        refreshToken,
        this.deviceFingerprint || undefined
      )
      
      return true
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }
  
  async getAccessToken(): Promise<string | null> {
    // First validate current token
    const payload = await this.validateCurrentSession()
    
    if (payload) {
      const { accessToken } = this.getStoredTokens()
      return accessToken
    }
    
    // Try to refresh if validation failed
    const refreshed = await this.refreshSession()
    if (refreshed) {
      const { accessToken } = this.getStoredTokens()
      return accessToken
    }
    
    return null
  }
  
  getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    const userId = this.getCurrentUserId()
    if (!userId) return { accessToken: null, refreshToken: null }
    
    return this.tokenService.getStoredTokens(userId)
  }
  
  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser
    
    const userJson = this.cookieStorage.getItem('user')
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson)
        return this.currentUser
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    }
    
    return null
  }
  
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser()
    return user?.id || null
  }
  
  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}
    
    // Get access token
    const accessToken = await this.getAccessToken()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    // Add CSRF token
    const csrfToken = this.getCsrfToken()
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    return headers
  }
  
  getCsrfToken(): string {
    return this.tokenService.getCsrfToken()
  }
  
  validateCsrfToken(token: string): boolean {
    return this.tokenService.validateCsrfToken(token)
  }
  
  async logout(): Promise<void> {
    const userId = this.getCurrentUserId()
    if (userId) {
      await this.tokenService.revokeSession(userId)
    }
    
    // Clear stored user
    this.cookieStorage.removeItem('user')
    this.currentUser = null
  }
  
  // Utility method to verify tokens from external sources (e.g., API responses)
  async verifyExternalToken(token: string): Promise<TokenPayload | null> {
    try {
      return await verifyToken(token, this.config.jwtConfig)
    } catch (error) {
      console.error('External token verification failed:', error)
      return null
    }
  }
  
  // Extract token from Authorization header
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    return extractBearerToken(authHeader)
  }
  
  destroy(): void {
    this.currentUser = null
    this.deviceFingerprint = null
  }
}

// Singleton instance
let secureTokenManager: SecureTokenManager | null = null

export function getSecureTokenManager(config?: SecureTokenManagerConfig): SecureTokenManager {
  if (!secureTokenManager) {
    secureTokenManager = new SecureTokenManager(config)
  }
  return secureTokenManager
}

export function destroySecureTokenManager(): void {
  if (secureTokenManager) {
    secureTokenManager.destroy()
    secureTokenManager = null
  }
}