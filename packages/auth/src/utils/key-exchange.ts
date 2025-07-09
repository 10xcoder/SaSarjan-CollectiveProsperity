export interface KeyPair {
  publicKey: string
  privateKey: string
}

export interface SharedSecret {
  secret: string
  derivedKey: CryptoKey
}

export class KeyExchange {
  private algorithm = {
    name: 'ECDH',
    namedCurve: 'P-256'
  }
  
  /**
   * Generate a key pair for key exchange
   */
  async generateKeyPair(): Promise<KeyPair> {
    if (typeof window === 'undefined') {
      throw new Error('Key exchange requires browser environment')
    }
    
    const keyPair = await crypto.subtle.generateKey(
      this.algorithm,
      true,
      ['deriveKey', 'deriveBits']
    )
    
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    
    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey)
    }
  }
  
  /**
   * Derive shared secret from private key and peer's public key
   */
  async deriveSharedSecret(
    privateKeyBase64: string,
    peerPublicKeyBase64: string
  ): Promise<SharedSecret> {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      this.base64ToArrayBuffer(privateKeyBase64),
      this.algorithm,
      false,
      ['deriveKey', 'deriveBits']
    )
    
    const peerPublicKey = await crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(peerPublicKeyBase64),
      this.algorithm,
      false,
      []
    )
    
    // Derive shared secret bits
    const sharedSecretBits = await crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: peerPublicKey
      },
      privateKey,
      256
    )
    
    // Derive AES key from shared secret
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: peerPublicKey
      },
      privateKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    )
    
    return {
      secret: this.arrayBufferToBase64(sharedSecretBits),
      derivedKey
    }
  }
  
  /**
   * Encrypt data using derived key
   */
  async encryptWithSharedKey(
    data: string,
    derivedKey: CryptoKey
  ): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      derivedKey,
      encoder.encode(data)
    )
    
    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv)
    }
  }
  
  /**
   * Decrypt data using derived key
   */
  async decryptWithSharedKey(
    encryptedBase64: string,
    ivBase64: string,
    derivedKey: CryptoKey
  ): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToArrayBuffer(ivBase64)
      },
      derivedKey,
      this.base64ToArrayBuffer(encryptedBase64)
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
  
  /**
   * Helper: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
  
  /**
   * Helper: Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

// Singleton instance
let keyExchange: KeyExchange | null = null

export function getKeyExchange(): KeyExchange {
  if (!keyExchange) {
    keyExchange = new KeyExchange()
  }
  return keyExchange
}