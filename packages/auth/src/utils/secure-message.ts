import { getKeyExchange } from './key-exchange'
import { getHMACValidator } from './hmac'

export interface SecureMessageEnvelope {
  // Message metadata
  id: string
  from: string
  to: string
  timestamp: number
  
  // Security
  nonce: string
  signature: string
  
  // Encrypted payload
  encryptedData?: string
  iv?: string
  
  // Plaintext payload (if not encrypted)
  payload?: any
}

export interface SecureMessageOptions {
  encrypt?: boolean
  sign?: boolean
  ttl?: number // Time to live in milliseconds
}

export class SecureMessaging {
  private keyExchange = getKeyExchange()
  private hmacValidator = getHMACValidator()
  private sharedSecrets: Map<string, CryptoKey> = new Map()
  
  /**
   * Create a secure message
   */
  async createMessage(
    from: string,
    to: string,
    payload: any,
    options: SecureMessageOptions = {}
  ): Promise<SecureMessageEnvelope> {
    const message: SecureMessageEnvelope = {
      id: this.generateId(),
      from,
      to,
      timestamp: Date.now(),
      nonce: this.generateNonce(),
      signature: '',
      payload
    }
    
    // Encrypt if requested and we have a shared secret
    if (options.encrypt) {
      const sharedKey = this.sharedSecrets.get(to)
      if (sharedKey) {
        const { encrypted, iv } = await this.keyExchange.encryptWithSharedKey(
          JSON.stringify(payload),
          sharedKey
        )
        
        message.encryptedData = encrypted
        message.iv = iv
        delete message.payload // Remove plaintext
      }
    }
    
    // Sign the message
    if (options.sign !== false) {
      const dataToSign = {
        ...message,
        signature: undefined
      }
      const signature = await this.hmacValidator.generateMessageHash(dataToSign, message.timestamp, message.nonce)
      message.signature = signature
    }
    
    return message
  }
  
  /**
   * Verify and decrypt a secure message
   */
  async verifyMessage(
    message: SecureMessageEnvelope,
    expectedFrom?: string
  ): Promise<{ valid: boolean; payload?: any; error?: string }> {
    // Check sender
    if (expectedFrom && message.from !== expectedFrom) {
      return { valid: false, error: 'Unexpected sender' }
    }
    
    // Check TTL
    const messageAge = Date.now() - message.timestamp
    if (messageAge > 5 * 60 * 1000) { // 5 minutes default TTL
      return { valid: false, error: 'Message expired' }
    }
    
    // Verify signature
    if (message.signature) {
      const dataToVerify = {
        ...message,
        signature: undefined
      }
      
      const signatureValid = await this.hmacValidator.verify(message)
      
      if (!signatureValid) {
        return { valid: false, error: 'Invalid signature' }
      }
    }
    
    // Decrypt if encrypted
    let payload = message.payload
    if (message.encryptedData && message.iv) {
      const sharedKey = this.sharedSecrets.get(message.from)
      if (!sharedKey) {
        return { valid: false, error: 'No shared key for decryption' }
      }
      
      try {
        const decrypted = await this.keyExchange.decryptWithSharedKey(
          message.encryptedData,
          message.iv,
          sharedKey
        )
        payload = JSON.parse(decrypted)
      } catch (error) {
        return { valid: false, error: 'Decryption failed' }
      }
    }
    
    return { valid: true, payload }
  }
  
  /**
   * Establish shared secret with another app
   */
  async establishSharedSecret(
    appId: string,
    peerPublicKey: string,
    ourPrivateKey: string
  ): Promise<void> {
    const { derivedKey } = await this.keyExchange.deriveSharedSecret(
      ourPrivateKey,
      peerPublicKey
    )
    
    this.sharedSecrets.set(appId, derivedKey)
  }
  
  /**
   * Remove shared secret
   */
  removeSharedSecret(appId: string): void {
    this.sharedSecrets.delete(appId)
  }
  
  /**
   * Check if we have a shared secret with an app
   */
  hasSharedSecret(appId: string): boolean {
    return this.sharedSecrets.has(appId)
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  private generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

// Singleton instance
let secureMessaging: SecureMessaging | null = null

export function getSecureMessaging(): SecureMessaging {
  if (!secureMessaging) {
    secureMessaging = new SecureMessaging()
  }
  return secureMessaging
}