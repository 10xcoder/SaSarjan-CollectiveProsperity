import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HMACValidator, getHMACValidator } from '@/utils/hmac'
import type { HMACConfig, SignedMessage } from '@/utils/hmac'

describe('HMAC Utilities', () => {
  let hmacValidator: HMACValidator
  const config: HMACConfig = {
    secret: 'test-hmac-secret-key-minimum-32-chars',
    algorithm: 'SHA-256',
    ttl: 300 // 5 minutes
  }

  beforeEach(() => {
    vi.clearAllMocks()
    hmacValidator = getHMACValidator(config)
  })

  describe('HMACValidator', () => {
    describe('sign', () => {
      it('should sign messages with HMAC', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        
        expect(signed.message).toEqual(message)
        expect(signed.signature).toBeDefined()
        expect(signed.timestamp).toBeDefined()
        expect(signed.nonce).toBeDefined()
        expect(typeof signed.signature).toBe('string')
        expect(signed.signature).toHaveLength(64) // HMAC-SHA256 hex
      })

      it('should generate different signatures for different messages', async () => {
        const message1 = { type: 'AUTH_EVENT', data: { userId: '123' } }
        const message2 = { type: 'AUTH_EVENT', data: { userId: '456' } }
        
        const signed1 = await hmacValidator.sign(message1)
        const signed2 = await hmacValidator.sign(message2)
        
        expect(signed1.signature).not.toBe(signed2.signature)
      })

      it('should generate different signatures with different nonces', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed1 = await hmacValidator.sign(message)
        const signed2 = await hmacValidator.sign(message)
        
        expect(signed1.nonce).not.toBe(signed2.nonce)
        expect(signed1.signature).not.toBe(signed2.signature)
      })
    })

    describe('verify', () => {
      it('should verify valid signed messages', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        const isValid = await hmacValidator.verify(signed)
        
        expect(isValid).toBe(true)
      })

      it('should reject messages with invalid signatures', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        // Tamper with signature
        const tamperedSigned = { ...signed, signature: 'invalid-signature' }
        
        const isValid = await hmacValidator.verify(tamperedSigned)
        
        expect(isValid).toBe(false)
      })

      it('should reject messages with tampered content', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        // Tamper with message content
        const tamperedSigned: SignedMessage = {
          ...signed,
          message: { type: 'AUTH_EVENT', data: { userId: '456' } }
        }
        
        const isValid = await hmacValidator.verify(tamperedSigned)
        
        expect(isValid).toBe(false)
      })

      it('should reject expired messages', async () => {
        const shortTtlValidator = getHMACValidator({ ...config, ttl: 0.001 }) // 1ms
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await shortTtlValidator.sign(message)
        
        // Wait for expiration
        await new Promise(resolve => setTimeout(resolve, 10))
        
        const isValid = await shortTtlValidator.verify(signed)
        
        expect(isValid).toBe(false)
      })

      it('should reject messages with future timestamps', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        // Set timestamp to future
        const futureSigned: SignedMessage = {
          ...signed,
          timestamp: Date.now() + 10000 // 10 seconds in future
        }
        
        const isValid = await hmacValidator.verify(futureSigned)
        
        expect(isValid).toBe(false)
      })
    })

    describe('nonce management', () => {
      it('should reject replayed messages with same nonce', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed = await hmacValidator.sign(message)
        
        // First verification should pass
        const isValid1 = await hmacValidator.verify(signed)
        expect(isValid1).toBe(true)
        
        // Second verification with same nonce should fail
        const isValid2 = await hmacValidator.verify(signed)
        expect(isValid2).toBe(false)
      })

      it('should allow different nonces', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        
        const signed1 = await hmacValidator.sign(message)
        const signed2 = await hmacValidator.sign(message)
        
        const isValid1 = await hmacValidator.verify(signed1)
        const isValid2 = await hmacValidator.verify(signed2)
        
        expect(isValid1).toBe(true)
        expect(isValid2).toBe(true)
      })
    })

    describe('generateMessageHash', () => {
      it('should generate consistent hashes for same message', async () => {
        const message = { type: 'AUTH_EVENT', data: { userId: '123' } }
        const timestamp = Date.now()
        const nonce = 'test-nonce'
        
        const hash1 = await hmacValidator.generateMessageHash(message, timestamp, nonce)
        const hash2 = await hmacValidator.generateMessageHash(message, timestamp, nonce)
        
        expect(hash1).toBe(hash2)
      })

      it('should generate different hashes for different messages', async () => {
        const message1 = { type: 'AUTH_EVENT', data: { userId: '123' } }
        const message2 = { type: 'AUTH_EVENT', data: { userId: '456' } }
        const timestamp = Date.now()
        const nonce = 'test-nonce'
        
        const hash1 = await hmacValidator.generateMessageHash(message1, timestamp, nonce)
        const hash2 = await hmacValidator.generateMessageHash(message2, timestamp, nonce)
        
        expect(hash1).not.toBe(hash2)
      })
    })
  })

  describe('getHMACValidator singleton', () => {
    it('should return same instance for same config', () => {
      const validator1 = getHMACValidator(config)
      const validator2 = getHMACValidator(config)
      
      expect(validator1).toBe(validator2)
    })

    it('should return different instances for different secrets', () => {
      const config1 = { ...config, secret: 'secret1-minimum-32-chars-long-enough' }
      const config2 = { ...config, secret: 'secret2-minimum-32-chars-long-enough' }
      
      const validator1 = getHMACValidator(config1)
      const validator2 = getHMACValidator(config2)
      
      expect(validator1).not.toBe(validator2)
    })
  })

  describe('error handling', () => {
    it('should throw for invalid secret length', () => {
      const invalidConfig = { ...config, secret: 'short' }
      
      expect(() => getHMACValidator(invalidConfig)).toThrow('HMAC secret must be at least 32 characters')
    })

    it('should throw for invalid algorithm', () => {
      const invalidConfig = { ...config, algorithm: 'INVALID' as any }
      
      expect(() => getHMACValidator(invalidConfig)).toThrow('Unsupported HMAC algorithm')
    })

    it('should handle malformed signed messages', async () => {
      const malformedMessage = {
        message: 'not an object',
        signature: 'invalid',
        timestamp: 'not a number',
        nonce: 123
      } as any
      
      const isValid = await hmacValidator.verify(malformedMessage)
      
      expect(isValid).toBe(false)
    })
  })
})