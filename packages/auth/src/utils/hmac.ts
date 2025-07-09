// Dynamic imports for Node crypto
let nodeCrypto: any = null
try {
  if (typeof window === 'undefined') {
    nodeCrypto = require('crypto')
  }
} catch (e) {
  // Not in Node environment or crypto not available
}

// For testing environments, try to load crypto synchronously
if (!nodeCrypto && typeof window === 'undefined') {
  try {
    nodeCrypto = require('crypto')
  } catch (e) {
    // Still not available
  }
}

export interface HMACConfig {
  secret?: string
  algorithm?: string
  ttl?: number
}

export class HMACValidator {
  private secret: string
  private algorithm: string
  private ttl: number
  private usedNonces: Set<string> = new Set()
  
  constructor(config: HMACConfig = {}) {
    if (config.secret && config.secret.length < 32) {
      throw new Error('HMAC secret must be at least 32 characters')
    }
    
    const supportedAlgorithms = ['SHA-256', 'SHA-512']
    if (config.algorithm && !supportedAlgorithms.includes(config.algorithm)) {
      throw new Error('Unsupported HMAC algorithm')
    }
    
    this.secret = config.secret || process.env.HMAC_SECRET_KEY || this.generateSecretKey()
    this.algorithm = config.algorithm || 'SHA-256'
    this.ttl = config.ttl || 300 // 5 minutes default
    
    // Ensure secret is at least 32 characters
    if (this.secret.length < 32) {
      this.secret = this.generateSecretKey()
    }
  }
  
  private generateSecretKey(): string {
    if (typeof window !== 'undefined') {
      // Browser environment - use Web Crypto API
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      return btoa(String.fromCharCode(...array))
    } else {
      // Node environment
      return nodeCrypto.randomBytes(32).toString('base64')
    }
  }
  
  /**
   * Generate HMAC signature for a message
   */
  async sign(message: any): Promise<SignedMessage> {
    const timestamp = Date.now()
    const nonce = this.generateNonce()
    
    const signedMessage: SignedMessage = {
      message,
      timestamp,
      nonce,
      signature: ''
    }
    
    const signature = await this.generateMessageHash(message, timestamp, nonce)
    signedMessage.signature = signature
    
    return signedMessage
  }
  
  /**
   * Generate message hash for HMAC
   */
  async generateMessageHash(message: any, timestamp: number, nonce: string): Promise<string> {
    const messageData = {
      message,
      timestamp,
      nonce
    }
    
    const data = JSON.stringify(messageData)
    
    if (typeof window !== 'undefined') {
      // Browser environment - use Web Crypto API
      return this.signBrowser(data)
    } else {
      // Node environment
      if (!nodeCrypto) {
        throw new Error('Node crypto module not available')
      }
      
      const algorithm = this.algorithm.toLowerCase().replace('-', '')
      const hmac = nodeCrypto.createHmac(algorithm, this.secret)
      hmac.update(data)
      const result = hmac.digest('hex')
      
      return result
    }
  }
  
  private async signBrowser(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.secret)
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: this.algorithm },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(data)
    )
    
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // SHA-256 should produce 32 bytes = 64 hex characters
    // If we get 64 bytes (128 hex chars), truncate to 32 bytes
    if (this.algorithm === 'SHA-256' && hashHex.length === 128) {
      return hashHex.slice(0, 64)
    }
    
    return hashHex
  }
  
  /**
   * Verify HMAC signature
   */
  async verify(signedMessage: SignedMessage): Promise<boolean> {
    try {
      // Check if message is properly formed
      if (!signedMessage || typeof signedMessage !== 'object') {
        return false
      }
      
      if (!signedMessage.signature || 
          typeof signedMessage.timestamp !== 'number' || !signedMessage.nonce) {
        return false
      }
      
      // Message content can be in either 'message' or 'payload' property
      const messageContent = signedMessage.message || signedMessage.payload
      if (!messageContent) {
        return false
      }
      
      // Check if message is expired
      const now = Date.now()
      const messageAge = (now - signedMessage.timestamp) / 1000 // in seconds
      if (messageAge > this.ttl) {
        return false
      }
      
      // Check if message is from the future (with 60 second tolerance)
      if (signedMessage.timestamp > now + 60000) {
        return false
      }
      
      // Check for nonce replay
      if (this.usedNonces.has(signedMessage.nonce)) {
        return false
      }
      
      // Verify signature
      const expectedSignature = await this.generateMessageHash(
        messageContent, 
        signedMessage.timestamp, 
        signedMessage.nonce
      )
      
      // Constant-time comparison to prevent timing attacks
      if (expectedSignature.length !== signedMessage.signature.length) {
        return false
      }
      
      let result = 0
      for (let i = 0; i < expectedSignature.length; i++) {
        result |= expectedSignature.charCodeAt(i) ^ signedMessage.signature.charCodeAt(i)
      }
      
      if (result === 0) {
        // Mark nonce as used
        this.usedNonces.add(signedMessage.nonce)
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }
  
  private generateNonce(): string {
    if (typeof window !== 'undefined') {
      const array = new Uint8Array(16)
      crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    } else {
      return nodeCrypto.randomBytes(16).toString('hex')
    }
  }

  /**
   * Create a signed message with timestamp and nonce (legacy API)
   */
  async createSignedMessage(payload: any, appId: string): Promise<SignedMessage> {
    const timestamp = Date.now()
    const nonce = this.generateNonce()
    
    const signedMessage: SignedMessage = {
      payload,
      appId,
      timestamp,
      nonce,
      signature: ''
    }
    
    const signature = await this.generateMessageHash(payload, timestamp, nonce)
    signedMessage.signature = signature
    
    return signedMessage
  }

  /**
   * Verify a signed message (legacy API)
   */
  async verifySignedMessage(message: SignedMessage): Promise<boolean> {
    return await this.verify(message)
  }
}

export interface SignedMessage {
  message?: any
  payload?: any
  appId?: string
  timestamp: number
  nonce: string
  signature: string
}

// Singleton instances keyed by config
const hmacValidatorInstances: Map<string, HMACValidator> = new Map()

export function getHMACValidator(config?: HMACConfig): HMACValidator {
  // Create a key based on config to allow different instances for different configs
  const key = JSON.stringify(config || {})
  
  if (!hmacValidatorInstances.has(key)) {
    hmacValidatorInstances.set(key, new HMACValidator(config))
  }
  
  return hmacValidatorInstances.get(key)!
}