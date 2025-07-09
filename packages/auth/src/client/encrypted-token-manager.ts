import { createSecureStorage, type SecureStorage } from '../utils/secure-storage'
import { createSecureCookieStorage, migrateFromLocalStorage, type SecureCookieStorage } from '../utils/cookie-storage'
import type { AuthSession } from '../types'

interface TokenPair {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  tokenType: string
}

export interface EncryptedTokenManagerConfig {
  storagePrefix?: string
  tokenRotation?: boolean
  maxRetries?: number
  useCookies?: boolean
  cookieDomain?: string
  encryptionPassword?: string
}

export class EncryptedTokenManager {
  private secureStorage: SecureStorage
  private cookieStorage: SecureCookieStorage | null = null
  private config: Required<EncryptedTokenManagerConfig>
  private tokenCache: Map<string, TokenPair>
  private rotationTimers: Map<string, NodeJS.Timeout>
  
  constructor(config: EncryptedTokenManagerConfig = {}) {
    this.config = {
      storagePrefix: config.storagePrefix || 'sasarjan-tokens',
      tokenRotation: config.tokenRotation ?? true,
      maxRetries: config.maxRetries || 3,
      useCookies: config.useCookies ?? true,
      cookieDomain: config.cookieDomain || '',
      encryptionPassword: config.encryptionPassword || process.env.TOKEN_ENCRYPTION_KEY || ''
    }
    
    // Initialize secure storage with encryption
    this.secureStorage = createSecureStorage({
      storageType: this.config.useCookies ? 'cookie' : 'localStorage',
      encryptionEnabled: true,
      encryptionPassword: this.config.encryptionPassword,
      cookieDomain: this.config.cookieDomain,
      prefix: this.config.storagePrefix
    })
    
    // Initialize cookie storage for CSRF tokens if using cookies
    if (this.config.useCookies) {
      this.cookieStorage = createSecureCookieStorage(this.config.storagePrefix, {
        domain: this.config.cookieDomain || undefined
      })
      
      // Migrate tokens from localStorage if needed
      this.migrateTokens()
    }
    
    this.tokenCache = new Map()
    this.rotationTimers = new Map()
    
    this.loadTokensFromStorage()
  }
  
  private async migrateTokens() {
    if (typeof window !== 'undefined' && this.cookieStorage) {
      await migrateFromLocalStorage(this.cookieStorage, this.config.storagePrefix)
    }
  }
  
  private async loadTokensFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      // Get all token keys
      const keys = await this.secureStorage.getKeys('token-')
      
      // Load each token pair
      for (const key of keys) {
        const tokenPair = await this.secureStorage.getItem(key)
        if (tokenPair && this.isTokenValid(tokenPair)) {
          const tokenKey = key.replace('token-', '')
          this.tokenCache.set(tokenKey, tokenPair)
          
          if (this.config.tokenRotation) {
            this.scheduleTokenRotation(tokenKey, tokenPair)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error)
    }
  }
  
  private async saveTokenToStorage(key: string, tokenPair: TokenPair) {
    try {
      await this.secureStorage.setItem(`token-${key}`, tokenPair, {
        encrypt: true,
        expires: tokenPair.expiresAt
      })
    } catch (error) {
      console.error('Failed to save token to storage:', error)
    }
  }
  
  private isTokenValid(token: TokenPair): boolean {
    return Date.now() < token.expiresAt
  }
  
  private scheduleTokenRotation(key: string, token: TokenPair) {
    // Clear existing timer
    const existingTimer = this.rotationTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // Schedule rotation at 80% of token lifetime
    const lifetime = token.expiresAt - Date.now()
    const rotationTime = lifetime * 0.8
    
    if (rotationTime > 0) {
      const timer = setTimeout(() => {
        this.rotateToken(key)
      }, rotationTime)
      
      this.rotationTimers.set(key, timer)
    }
  }
  
  private async rotateToken(key: string) {
    const token = this.tokenCache.get(key)
    if (!token || !token.refreshToken) return
    
    try {
      // In a real implementation, this would call the auth service
      console.log(`Rotating token for key: ${key}`)
      
      // The auth service would provide new tokens here
      // For now, just remove the old token
      await this.removeToken(key)
    } catch (error) {
      console.error(`Failed to rotate token for key ${key}:`, error)
    }
  }
  
  async storeToken(key: string, token: string, expiresIn: number, refreshToken?: string) {
    const tokenPair: TokenPair = {
      accessToken: token,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      tokenType: 'Bearer'
    }
    
    // Store in cache
    this.tokenCache.set(key, tokenPair)
    
    // Store encrypted in secure storage
    await this.saveTokenToStorage(key, tokenPair)
    
    // Schedule rotation if enabled
    if (this.config.tokenRotation && refreshToken) {
      this.scheduleTokenRotation(key, tokenPair)
    }
  }
  
  async storeSessionTokens(session: AuthSession) {
    if (session.access_token) {
      const expiresIn = session.expires_in || 3600 // Default 1 hour
      await this.storeToken(
        'access',
        session.access_token,
        expiresIn,
        session.refresh_token
      )
    }
    
    if (session.provider_token) {
      // Store provider tokens separately
      await this.storeToken(
        `provider-${session.provider}`,
        session.provider_token,
        session.expires_in || 3600,
        session.provider_refresh_token
      )
    }
  }
  
  async getToken(key: string): Promise<string | null> {
    // Check cache first
    let tokenPair = this.tokenCache.get(key)
    
    // If not in cache, try to load from storage
    if (!tokenPair) {
      tokenPair = await this.secureStorage.getItem(`token-${key}`)
      if (tokenPair) {
        this.tokenCache.set(key, tokenPair)
      }
    }
    
    if (!tokenPair) return null
    
    // Check validity
    if (!this.isTokenValid(tokenPair)) {
      await this.removeToken(key)
      return null
    }
    
    return tokenPair.accessToken
  }
  
  async getAccessToken(): Promise<string | null> {
    return this.getToken('access')
  }
  
  async getRefreshToken(): Promise<string | null> {
    const tokenPair = this.tokenCache.get('access') || 
                     await this.secureStorage.getItem('token-access')
    
    if (!tokenPair || !tokenPair.refreshToken) return null
    
    return tokenPair.refreshToken
  }
  
  async removeToken(key: string) {
    // Remove from cache
    this.tokenCache.delete(key)
    
    // Clear rotation timer
    const timer = this.rotationTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.rotationTimers.delete(key)
    }
    
    // Remove from storage
    await this.secureStorage.removeItem(`token-${key}`)
  }
  
  async clearAllTokens() {
    // Clear cache
    this.tokenCache.clear()
    
    // Clear all timers
    this.rotationTimers.forEach(timer => clearTimeout(timer))
    this.rotationTimers.clear()
    
    // Clear storage
    await this.secureStorage.clear()
  }
  
  async validateToken(token: string): Promise<boolean> {
    // Check all cached tokens
    for (const [_, tokenPair] of this.tokenCache) {
      if (tokenPair.accessToken === token) {
        return this.isTokenValid(tokenPair)
      }
    }
    
    // Check storage if not in cache
    const keys = await this.secureStorage.getKeys('token-')
    for (const key of keys) {
      const tokenPair = await this.secureStorage.getItem(key)
      if (tokenPair && tokenPair.accessToken === token) {
        return this.isTokenValid(tokenPair)
      }
    }
    
    return false
  }
  
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Add CSRF token if using cookies
    if (this.config.useCookies && this.cookieStorage) {
      const csrfToken = this.cookieStorage.getCsrfToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }
    
    return headers
  }
  
  getCsrfToken(): string | null {
    if (this.config.useCookies && this.cookieStorage) {
      return this.cookieStorage.getCsrfToken()
    }
    return null
  }
  
  validateCsrfToken(token: string): boolean {
    if (this.config.useCookies && this.cookieStorage) {
      return this.cookieStorage.validateCsrfToken(token)
    }
    return false
  }
  
  destroy() {
    this.rotationTimers.forEach(timer => clearTimeout(timer))
    this.rotationTimers.clear()
    this.tokenCache.clear()
  }
}

// Singleton instance
let encryptedTokenManager: EncryptedTokenManager | null = null

export function getEncryptedTokenManager(config?: EncryptedTokenManagerConfig): EncryptedTokenManager {
  if (!encryptedTokenManager) {
    encryptedTokenManager = new EncryptedTokenManager(config)
  }
  return encryptedTokenManager
}

export function destroyEncryptedTokenManager() {
  if (encryptedTokenManager) {
    encryptedTokenManager.destroy()
    encryptedTokenManager = null
  }
}