/**
 * Secure encryption utilities using Web Crypto API
 * Implements AES-GCM encryption with PBKDF2 key derivation
 */

export interface EncryptionConfig {
  algorithm?: 'AES-GCM' | 'AES-CBC'
  keyLength?: 128 | 192 | 256
  iterations?: number
  saltLength?: number
  ivLength?: number
  tagLength?: number
}

const DEFAULT_CONFIG: Required<EncryptionConfig> = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000, // PBKDF2 iterations
  saltLength: 16,     // 128 bits
  ivLength: 12,       // 96 bits for GCM
  tagLength: 128      // 128 bits
}

// Crypto availability check
export function isCryptoAvailable(): boolean {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return true
  }
  return false
}

// Convert string to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str)
}

// Convert ArrayBuffer to string
function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer)
}

// Convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Derive encryption key from password using PBKDF2
export async function deriveKey(
  password: string,
  salt: ArrayBuffer,
  config: EncryptionConfig = {}
): Promise<CryptoKey> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  // Derive key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: finalConfig.iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: finalConfig.algorithm,
      length: finalConfig.keyLength
    },
    true,
    ['encrypt', 'decrypt']
  )
}

// Generate cryptographically secure random bytes
export function generateRandomBytes(length: number): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(length)).buffer
}

// Encrypted data structure
export interface EncryptedData {
  ciphertext: string  // Base64 encoded
  salt: string        // Base64 encoded
  iv: string          // Base64 encoded
  algorithm: string
  iterations: number
  keyLength: number
}

// Encrypt data using AES-GCM
export async function encrypt(
  plaintext: string,
  password: string,
  config: EncryptionConfig = {}
): Promise<EncryptedData> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available')
  }
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Generate random salt and IV
  const salt = generateRandomBytes(finalConfig.saltLength)
  const iv = generateRandomBytes(finalConfig.ivLength)
  
  // Derive key from password
  const key = await deriveKey(password, salt, config)
  
  // Encrypt the plaintext
  const encodedPlaintext = stringToBuffer(plaintext)
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: finalConfig.algorithm,
      iv,
      ...(finalConfig.algorithm === 'AES-GCM' ? { tagLength: finalConfig.tagLength as any } : {})
    },
    key,
    encodedPlaintext
  )
  
  return {
    ciphertext: bufferToBase64(cipherBuffer),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    algorithm: finalConfig.algorithm,
    iterations: finalConfig.iterations,
    keyLength: finalConfig.keyLength
  }
}

// Decrypt data using AES-GCM
export async function decrypt(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available')
  }
  
  // Convert from base64
  const salt = base64ToBuffer(encryptedData.salt)
  const iv = base64ToBuffer(encryptedData.iv)
  const cipherBuffer = base64ToBuffer(encryptedData.ciphertext)
  
  // Derive key from password
  const key = await deriveKey(password, salt, {
    algorithm: encryptedData.algorithm as any,
    iterations: encryptedData.iterations,
    keyLength: encryptedData.keyLength as any
  })
  
  // Decrypt the ciphertext
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: encryptedData.algorithm,
      iv,
      ...(encryptedData.algorithm === 'AES-GCM' ? { tagLength: DEFAULT_CONFIG.tagLength } : {})
    },
    key,
    cipherBuffer
  )
  
  return bufferToString(decryptedBuffer)
}

// Secure key generation for encryption
export async function generateEncryptionKey(
  length: number = 256
): Promise<string> {
  if (length !== 256 && length !== 192 && length !== 128) {
    throw new Error('Key length must be 128, 192, or 256 bits')
  }
  const keyBytes = generateRandomBytes(length / 8)
  return bufferToBase64(keyBytes)
}

// Hash data using SHA-256
export async function hash(data: string): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available')
  }
  
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    stringToBuffer(data)
  )
  
  return bufferToBase64(hashBuffer)
}

// HMAC for message authentication
export async function hmac(
  data: string,
  secret: string
): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available')
  }
  
  // Import secret as key
  const key = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )
  
  // Sign the data
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBuffer(data)
  )
  
  return bufferToBase64(signature)
}

// Verify HMAC signature
export async function verifyHmac(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API not available')
  }
  
  // Import secret as key
  const key = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  )
  
  // Verify the signature
  return crypto.subtle.verify(
    'HMAC',
    key,
    base64ToBuffer(signature),
    stringToBuffer(data)
  )
}

// Constant-time string comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

// Secure random string generation
export function generateSecureRandom(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length]
  }
  
  return result
}

// Key wrapping for secure key storage
export async function wrapKey(
  keyToWrap: CryptoKey,
  wrappingKey: CryptoKey,
  wrapAlgo: 'AES-KW' | 'AES-GCM' = 'AES-GCM'
): Promise<ArrayBuffer> {
  const iv = wrapAlgo === 'AES-GCM' ? generateRandomBytes(12) : undefined
  
  return crypto.subtle.wrapKey(
    'raw',
    keyToWrap,
    wrappingKey,
    wrapAlgo === 'AES-GCM' ? { name: wrapAlgo, iv } : { name: wrapAlgo }
  )
}

// Key unwrapping
export async function unwrapKey(
  wrappedKey: ArrayBuffer,
  unwrappingKey: CryptoKey,
  wrapAlgo: 'AES-KW' | 'AES-GCM' = 'AES-GCM',
  keyAlgo: any,
  extractable: boolean,
  keyUsages: KeyUsage[],
  iv?: ArrayBuffer
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    unwrappingKey,
    wrapAlgo === 'AES-GCM' ? { name: wrapAlgo, iv: iv! } : { name: wrapAlgo },
    keyAlgo,
    extractable,
    keyUsages
  )
}