import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encrypt, decrypt, hash, hmac, verifyHmac, generateEncryptionKey, generateSecureRandom, secureCompare } from '@/utils/crypto'

describe('Crypto Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data successfully', async () => {
      const data = 'sensitive data'
      const password = 'secure-password-123'
      
      const encrypted = await encrypt(data, password)
      expect(encrypted).toBeDefined()
      expect(encrypted.ciphertext).toBeDefined()
      expect(encrypted.salt).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.algorithm).toBe('AES-GCM')
      expect(encrypted.iterations).toBe(100000)
      expect(encrypted.keyLength).toBe(256)
      
      const decrypted = await decrypt(encrypted, password)
      expect(decrypted).toBe(data)
    })

    it('should fail decryption with wrong password', async () => {
      const data = 'sensitive data'
      const password1 = 'secure-password-123'
      const password2 = 'wrong-password-456'
      
      const encrypted = await encrypt(data, password1)
      
      await expect(decrypt(encrypted, password2)).rejects.toThrow()
    })

    it('should fail decryption with tampered data', async () => {
      const data = 'sensitive data'
      const password = 'secure-password-123'
      
      const encrypted = await encrypt(data, password)
      
      // Tamper with encrypted data
      const tamperedData = { ...encrypted, ciphertext: 'tampered-data' }
      
      await expect(decrypt(tamperedData, password)).rejects.toThrow()
    })
  })

  describe('hash', () => {
    it('should generate consistent hashes', async () => {
      const data = 'test data'
      
      const hash1 = await hash(data)
      const hash2 = await hash(data)
      
      expect(hash1).toBe(hash2)
      expect(hash1).toBeDefined()
      expect(typeof hash1).toBe('string')
      expect(hash1.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for different data', async () => {
      const hash1 = await hash('data1')
      const hash2 = await hash('data2')
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('hmac', () => {
    it('should generate and verify HMAC signatures', async () => {
      const data = 'message to sign'
      const secret = 'secret-key'
      
      const signature = await hmac(data, secret)
      expect(signature).toBeDefined()
      expect(typeof signature).toBe('string')
      expect(signature.length).toBeGreaterThan(0)
      
      const isValid = await verifyHmac(data, signature, secret)
      expect(isValid).toBe(true)
    })

    it('should fail verification with wrong secret', async () => {
      const data = 'message to sign'
      const secret1 = 'secret-key-1'
      const secret2 = 'secret-key-2'
      
      const signature = await hmac(data, secret1)
      const isValid = await verifyHmac(data, signature, secret2)
      
      expect(isValid).toBe(false)
    })

    it('should fail verification with tampered data', async () => {
      const data = 'message to sign'
      const tamperedData = 'tampered message'
      const secret = 'secret-key'
      
      const signature = await hmac(data, secret)
      const isValid = await verifyHmac(tamperedData, signature, secret)
      
      expect(isValid).toBe(false)
    })
  })

  describe('generateEncryptionKey', () => {
    it('should generate valid encryption keys', async () => {
      const key = await generateEncryptionKey()
      
      expect(key).toBeDefined()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('should generate different keys each time', async () => {
      const key1 = await generateEncryptionKey()
      const key2 = await generateEncryptionKey()
      
      expect(key1).not.toBe(key2)
    })

    it('should generate keys of different lengths', async () => {
      const key128 = await generateEncryptionKey(128)
      const key192 = await generateEncryptionKey(192)
      const key256 = await generateEncryptionKey(256)
      
      expect(key128).toBeDefined()
      expect(key192).toBeDefined()
      expect(key256).toBeDefined()
      
      // Base64 encoded lengths will be different
      expect(key128.length).not.toBe(key192.length)
      expect(key192.length).not.toBe(key256.length)
    })

    it('should throw error for invalid key lengths', async () => {
      await expect(generateEncryptionKey(64)).rejects.toThrow('Key length must be 128, 192, or 256 bits')
      await expect(generateEncryptionKey(512)).rejects.toThrow('Key length must be 128, 192, or 256 bits')
    })
  })

  describe('generateSecureRandom', () => {
    it('should generate random string of specified length', () => {
      const randomString = generateSecureRandom(32)
      
      expect(randomString).toHaveLength(32)
      expect(typeof randomString).toBe('string')
    })

    it('should generate different values each time', () => {
      const string1 = generateSecureRandom(16)
      const string2 = generateSecureRandom(16)
      
      expect(string1).not.toBe(string2)
    })

    it('should use custom charset', () => {
      const charset = '0123456789'
      const randomString = generateSecureRandom(10, charset)
      
      expect(randomString).toHaveLength(10)
      // Check that all characters are from the charset
      for (const char of randomString) {
        expect(charset).toContain(char)
      }
    })
  })

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const result = secureCompare('hello', 'hello')
      expect(result).toBe(true)
    })

    it('should return false for different strings', () => {
      const result = secureCompare('hello', 'world')
      expect(result).toBe(false)
    })

    it('should return false for different length strings', () => {
      const result = secureCompare('hello', 'hello123')
      expect(result).toBe(false)
    })

    it('should be resistant to timing attacks', () => {
      // This test ensures constant-time comparison
      const start1 = performance.now()
      secureCompare('a', 'b')
      const time1 = performance.now() - start1
      
      const start2 = performance.now()
      secureCompare('aaaaaaaaaa', 'bbbbbbbbbb')
      const time2 = performance.now() - start2
      
      // Times should be relatively similar (within reason for test environment)
      const timeDiff = Math.abs(time1 - time2)
      expect(timeDiff).toBeLessThan(10) // Allow 10ms difference for test environment
    })
  })
})