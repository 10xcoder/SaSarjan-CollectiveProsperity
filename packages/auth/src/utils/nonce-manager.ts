export interface NonceConfig {
  maxAge?: number // Maximum age of nonce in milliseconds
  cleanupInterval?: number // Cleanup interval in milliseconds
  maxNonces?: number // Maximum number of nonces to store
}

export class NonceManager {
  private nonces: Map<string, number> = new Map()
  private config: Required<NonceConfig>
  private cleanupTimer?: NodeJS.Timeout
  
  constructor(config: NonceConfig = {}) {
    this.config = {
      maxAge: config.maxAge || 5 * 60 * 1000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60 * 1000, // 1 minute
      maxNonces: config.maxNonces || 10000
    }
    
    this.startCleanup()
  }
  
  /**
   * Check if a nonce has been used
   */
  hasBeenUsed(nonce: string): boolean {
    const timestamp = this.nonces.get(nonce)
    if (!timestamp) {
      return false
    }
    
    // Check if nonce has expired
    if (Date.now() - timestamp > this.config.maxAge) {
      this.nonces.delete(nonce)
      return false
    }
    
    return true
  }
  
  /**
   * Mark a nonce as used
   */
  markAsUsed(nonce: string): void {
    // Prevent unbounded growth
    if (this.nonces.size >= this.config.maxNonces) {
      // Remove oldest nonces
      const entriesToRemove = Math.floor(this.config.maxNonces * 0.1) // Remove 10%
      const sortedEntries = Array.from(this.nonces.entries())
        .sort((a, b) => a[1] - b[1])
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.nonces.delete(sortedEntries[i][0])
      }
    }
    
    this.nonces.set(nonce, Date.now())
  }
  
  /**
   * Validate a nonce (check if unused and mark as used)
   */
  validateAndConsume(nonce: string): boolean {
    if (this.hasBeenUsed(nonce)) {
      return false
    }
    
    this.markAsUsed(nonce)
    return true
  }
  
  /**
   * Start periodic cleanup of expired nonces
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
    
    // Handle Node.js cleanup
    if (typeof process !== 'undefined' && process.on) {
      process.on('beforeExit', () => this.destroy())
    }
  }
  
  /**
   * Clean up expired nonces
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredNonces: string[] = []
    
    for (const [nonce, timestamp] of this.nonces.entries()) {
      if (now - timestamp > this.config.maxAge) {
        expiredNonces.push(nonce)
      }
    }
    
    for (const nonce of expiredNonces) {
      this.nonces.delete(nonce)
    }
  }
  
  /**
   * Clear all nonces
   */
  clear(): void {
    this.nonces.clear()
  }
  
  /**
   * Destroy the nonce manager
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }
  
  /**
   * Get current nonce count
   */
  getCount(): number {
    return this.nonces.size
  }
}

// Singleton instance
let nonceManager: NonceManager | null = null

export function getNonceManager(config?: NonceConfig): NonceManager {
  if (!nonceManager) {
    nonceManager = new NonceManager(config)
  }
  return nonceManager
}

export function destroyNonceManager(): void {
  if (nonceManager) {
    nonceManager.destroy()
    nonceManager = null
  }
}