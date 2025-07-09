/**
 * Server-side encryption utilities using Node.js crypto module
 * Implements AES-GCM encryption with PBKDF2 key derivation for Node.js
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2, createHmac, createHash, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const pbkdf2Async = promisify(pbkdf2)

export interface NodeEncryptionConfig {
  algorithm?: 'aes-256-gcm' | 'aes-192-gcm' | 'aes-128-gcm'
  iterations?: number
  saltLength?: number
  ivLength?: number
  tagLength?: number
}

const DEFAULT_CONFIG: Required<NodeEncryptionConfig> = {
  algorithm: 'aes-256-gcm',
  iterations: 100000,
  saltLength: 32,     // 256 bits
  ivLength: 16,       // 128 bits
  tagLength: 16       // 128 bits
}

// Get key length from algorithm
function getKeyLength(algorithm: string): number {
  const match = algorithm.match(/aes-(\d+)-/)
  return match ? parseInt(match[1]) / 8 : 32
}

// Derive encryption key from password using PBKDF2
export async function deriveKeyNode(
  password: string,
  salt: Buffer,
  config: NodeEncryptionConfig = {}
): Promise<Buffer> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const keyLength = getKeyLength(finalConfig.algorithm)
  
  return pbkdf2Async(
    password,
    salt,
    finalConfig.iterations,
    keyLength,
    'sha256'
  )
}

// Encrypted data structure
export interface NodeEncryptedData {
  ciphertext: string  // Base64 encoded
  salt: string        // Base64 encoded
  iv: string          // Base64 encoded
  tag: string         // Base64 encoded
  algorithm: string
  iterations: number
}

// Encrypt data using AES-GCM
export async function encryptNode(
  plaintext: string,
  password: string,
  config: NodeEncryptionConfig = {}
): Promise<NodeEncryptedData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Generate random salt and IV
  const salt = randomBytes(finalConfig.saltLength)
  const iv = randomBytes(finalConfig.ivLength)
  
  // Derive key from password
  const key = await deriveKeyNode(password, salt, config)
  
  // Create cipher
  const cipher = createCipheriv(finalConfig.algorithm, key, iv)
  
  // Encrypt the plaintext
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])
  
  // Get the authentication tag
  const tag = cipher.getAuthTag()
  
  return {
    ciphertext: encrypted.toString('base64'),
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algorithm: finalConfig.algorithm,
    iterations: finalConfig.iterations
  }
}

// Decrypt data using AES-GCM
export async function decryptNode(
  encryptedData: NodeEncryptedData,
  password: string
): Promise<string> {
  // Convert from base64
  const salt = Buffer.from(encryptedData.salt, 'base64')
  const iv = Buffer.from(encryptedData.iv, 'base64')
  const tag = Buffer.from(encryptedData.tag, 'base64')
  const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64')
  
  // Derive key from password
  const key = await deriveKeyNode(password, salt, {
    algorithm: encryptedData.algorithm as any,
    iterations: encryptedData.iterations
  })
  
  // Create decipher
  const decipher = createDecipheriv(encryptedData.algorithm, key, iv) as any
  decipher.setAuthTag(tag)
  
  // Decrypt the ciphertext
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ])
  
  return decrypted.toString('utf8')
}

// Generate secure random bytes
export function generateRandomBytesNode(length: number): Buffer {
  return randomBytes(length)
}

// Generate encryption key
export function generateEncryptionKeyNode(length: 256 | 192 | 128 = 256): string {
  return randomBytes(length / 8).toString('base64')
}

// Hash data using SHA-256
export function hashNode(data: string): string {
  return createHash('sha256').update(data).digest('base64')
}

// HMAC for message authentication
export function hmacNode(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64')
}

// Verify HMAC signature
export function verifyHmacNode(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = hmacNode(data, secret)
  const expected = Buffer.from(expectedSignature, 'base64')
  const actual = Buffer.from(signature, 'base64')
  
  if (expected.length !== actual.length) {
    return false
  }
  
  return timingSafeEqual(expected, actual)
}

// Constant-time string comparison
export function secureCompareNode(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  
  return timingSafeEqual(bufferA, bufferB)
}

// Secure random string generation
export function generateSecureRandomNode(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  const bytes = randomBytes(length)
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length]
  }
  
  return result
}

// Environment-based encryption key management
export class EncryptionKeyManager {
  private static instance: EncryptionKeyManager
  private masterKey: Buffer | null = null
  
  private constructor() {
    this.loadMasterKey()
  }
  
  static getInstance(): EncryptionKeyManager {
    if (!this.instance) {
      this.instance = new EncryptionKeyManager()
    }
    return this.instance
  }
  
  private loadMasterKey(): void {
    const keyBase64 = process.env.MASTER_ENCRYPTION_KEY
    
    if (!keyBase64) {
      console.warn('MASTER_ENCRYPTION_KEY not set. Using default key (not secure for production)')
      this.masterKey = Buffer.from('default-insecure-key-change-this-in-production!!')
      return
    }
    
    try {
      this.masterKey = Buffer.from(keyBase64, 'base64')
      if (this.masterKey.length < 32) {
        throw new Error('Master key must be at least 256 bits')
      }
    } catch (error) {
      console.error('Failed to load master encryption key:', error)
      throw new Error('Invalid MASTER_ENCRYPTION_KEY')
    }
  }
  
  getMasterKey(): Buffer {
    if (!this.masterKey) {
      throw new Error('Master encryption key not initialized')
    }
    return this.masterKey
  }
  
  // Derive a key for a specific purpose
  async deriveKey(purpose: string, length: number = 32): Promise<Buffer> {
    const salt = Buffer.from(purpose, 'utf8')
    return pbkdf2Async(this.getMasterKey(), salt, 10000, length, 'sha256')
  }
  
  // Encrypt with master key
  async encryptWithMasterKey(plaintext: string): Promise<NodeEncryptedData> {
    const key = await this.deriveKey('encryption', 32)
    return encryptNode(plaintext, key.toString('base64'))
  }
  
  // Decrypt with master key
  async decryptWithMasterKey(encryptedData: NodeEncryptedData): Promise<string> {
    const key = await this.deriveKey('encryption', 32)
    return decryptNode(encryptedData, key.toString('base64'))
  }
}

// Export singleton instance methods
export const keyManager = EncryptionKeyManager.getInstance()

// Utility function to ensure crypto operations work in both environments
export function isNodeCrypto(): boolean {
  return typeof globalThis === 'object' && 
         typeof globalThis.process === 'object' && 
         typeof require === 'function'
}