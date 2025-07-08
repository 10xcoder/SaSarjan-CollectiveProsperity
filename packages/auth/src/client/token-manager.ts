import { createSecureStorage } from '../utils/storage'
import type { AuthSession } from '../types'

interface TokenPair {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  tokenType: string
}

interface TokenManagerConfig {
  storagePrefix?: string
  enableEncryption?: boolean
  tokenRotation?: boolean
  maxRetries?: number
}

export class TokenManager {
  private storage: ReturnType<typeof createSecureStorage>
  private config: Required<TokenManagerConfig>
  private tokenCache: Map<string, TokenPair>
  private rotationTimers: Map<string, NodeJS.Timeout>
  
  constructor(config: TokenManagerConfig = {}) {
    this.config = {
      storagePrefix: config.storagePrefix || 'sasarjan-tokens',
      enableEncryption: config.enableEncryption ?? true,
      tokenRotation: config.tokenRotation ?? true,
      maxRetries: config.maxRetries || 3
    }
    
    this.storage = createSecureStorage(this.config.storagePrefix)
    this.tokenCache = new Map()
    this.rotationTimers = new Map()
    
    this.loadTokensFromStorage()
  }
  
  private loadTokensFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const storedTokens = this.storage.getItem('token-pairs')
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens) as Record<string, TokenPair>
        Object.entries(tokens).forEach(([key, token]) => {
          if (this.isTokenValid(token)) {
            this.tokenCache.set(key, token)
            if (this.config.tokenRotation) {
              this.scheduleTokenRotation(key, token)
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error)
    }
  }
  
  private saveTokensToStorage() {
    try {
      const tokens: Record<string, TokenPair> = {}
      this.tokenCache.forEach((token, key) => {
        tokens[key] = token
      })
      this.storage.setItem('token-pairs', JSON.stringify(tokens))
    } catch (error) {
      console.error('Failed to save tokens to storage:', error)
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
      // For now, we'll simulate token rotation
      console.log(`Rotating token for key: ${key}`)
      
      // Remove the old token
      this.removeToken(key)
      
      // The auth service would provide new tokens here
    } catch (error) {
      console.error(`Failed to rotate token for key ${key}:`, error)
    }
  }
  
  private encryptToken(token: string): string {
    if (!this.config.enableEncryption) return token
    
    // Simple XOR encryption for demo purposes
    // In production, use Web Crypto API
    const key = 'sasarjan-secret-key'
    let encrypted = ''
    
    for (let i = 0; i < token.length; i++) {
      encrypted += String.fromCharCode(
        token.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    
    return btoa(encrypted)
  }
  
  private decryptToken(encrypted: string): string {
    if (!this.config.enableEncryption) return encrypted
    
    try {
      const decoded = atob(encrypted)
      const key = 'sasarjan-secret-key'
      let decrypted = ''
      
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        )
      }
      
      return decrypted
    } catch (error) {
      console.error('Failed to decrypt token:', error)
      return ''
    }
  }
  
  storeToken(key: string, token: string, expiresIn: number, refreshToken?: string) {
    const tokenPair: TokenPair = {
      accessToken: this.encryptToken(token),
      refreshToken: refreshToken ? this.encryptToken(refreshToken) : undefined,
      expiresAt: Date.now() + expiresIn * 1000,
      tokenType: 'Bearer'
    }
    
    this.tokenCache.set(key, tokenPair)
    this.saveTokensToStorage()
    
    if (this.config.tokenRotation && refreshToken) {
      this.scheduleTokenRotation(key, tokenPair)
    }
  }
  
  storeSessionTokens(session: AuthSession) {
    if (session.access_token) {
      const expiresIn = session.expires_in || 3600 // Default 1 hour
      this.storeToken(
        'access',
        session.access_token,
        expiresIn,
        session.refresh_token
      )
    }
    
    if (session.provider_token) {
      // Store provider tokens separately
      this.storeToken(
        `provider-${session.provider}`,
        session.provider_token,
        session.expires_in || 3600,
        session.provider_refresh_token
      )
    }
  }
  
  getToken(key: string): string | null {
    const tokenPair = this.tokenCache.get(key)
    
    if (!tokenPair) return null
    
    if (!this.isTokenValid(tokenPair)) {
      this.removeToken(key)
      return null
    }
    
    return this.decryptToken(tokenPair.accessToken)
  }
  
  getAccessToken(): string | null {
    return this.getToken('access')
  }
  
  getRefreshToken(): string | null {
    const tokenPair = this.tokenCache.get('access')
    if (!tokenPair || !tokenPair.refreshToken) return null
    
    return this.decryptToken(tokenPair.refreshToken)
  }
  
  removeToken(key: string) {
    this.tokenCache.delete(key)
    
    const timer = this.rotationTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.rotationTimers.delete(key)
    }
    
    this.saveTokensToStorage()
  }
  
  clearAllTokens() {
    this.tokenCache.clear()
    
    this.rotationTimers.forEach(timer => clearTimeout(timer))
    this.rotationTimers.clear()
    
    this.storage.clear()
  }
  
  async validateToken(token: string): Promise<boolean> {
    // In production, this would validate with the auth server
    // For now, just check if it's not expired
    const tokenPair = Array.from(this.tokenCache.values()).find(
      pair => this.decryptToken(pair.accessToken) === token
    )
    
    return tokenPair ? this.isTokenValid(tokenPair) : false
  }
  
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken()
    if (!token) return {}
    
    return {
      'Authorization': `Bearer ${token}`
    }
  }
  
  destroy() {
    this.rotationTimers.forEach(timer => clearTimeout(timer))
    this.rotationTimers.clear()
    this.tokenCache.clear()
  }
}

// Singleton instance
let tokenManager: TokenManager | null = null

export function getTokenManager(config?: TokenManagerConfig): TokenManager {
  if (!tokenManager) {
    tokenManager = new TokenManager(config)
  }
  return tokenManager
}

export function destroyTokenManager() {
  if (tokenManager) {
    tokenManager.destroy()
    tokenManager = null
  }
}