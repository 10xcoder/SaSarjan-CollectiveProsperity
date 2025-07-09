import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateJWTKeyPair, signToken, verifyToken, generateTokenPair, rotateTokens, revokeToken, isTokenRevoked, extractBearerToken, hashFingerprint, validateTokenClaims } from '@/utils/jwt'
import type { TokenPayload, DeviceFingerprint } from '@/utils/jwt'

describe('JWT Utilities', () => {
  let keyPair: CryptoKeyPair
  let deviceFingerprint: DeviceFingerprint

  beforeEach(async () => {
    vi.clearAllMocks()
    keyPair = await generateJWTKeyPair()
    deviceFingerprint = {
      userAgent: 'Mozilla/5.0 (Test Browser)',
      screen: '1920x1080',
      timezone: 'UTC',
      language: 'en-US',
      platform: 'Test Platform'
    }
  })

  describe('generateJWTKeyPair', () => {
    it('should generate valid key pair', async () => {
      const keys = await generateJWTKeyPair()
      
      expect(keys.privateKey).toBeDefined()
      expect(keys.publicKey).toBeDefined()
      expect(keys.privateKey.type).toBe('private')
      expect(keys.publicKey.type).toBe('public')
      expect(keys.privateKey.algorithm.name).toBe('ECDSA')
      expect(keys.publicKey.algorithm.name).toBe('ECDSA')
    })
  })

  describe('signToken and verifyToken', () => {
    it('should sign and verify tokens successfully', async () => {
      const payload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      const token = await signToken(payload, keyPair.privateKey)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format

      const verified = await verifyToken(token, keyPair.publicKey)
      expect(verified).toEqual(payload)
    })

    it('should fail verification with wrong key', async () => {
      const payload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      const wrongKeyPair = await generateJWTKeyPair()
      const token = await signToken(payload, keyPair.privateKey)

      await expect(verifyToken(token, wrongKeyPair.publicKey)).rejects.toThrow()
    })

    it('should fail verification for expired tokens', async () => {
      const payload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      const token = await signToken(payload, keyPair.privateKey)

      await expect(verifyToken(token, keyPair.publicKey)).rejects.toThrow('Token expired')
    })
  })

  describe('generateTokenPair', () => {
    it('should generate access and refresh token pair', async () => {
      const userId = 'user-123'
      const email = 'test@example.com'
      const role = 'customer'

      const tokens = await generateTokenPair(
        userId,
        email,
        role,
        deviceFingerprint,
        keyPair.privateKey
      )

      expect(tokens.accessToken).toBeDefined()
      expect(tokens.refreshToken).toBeDefined()
      expect(tokens.expiresAt).toBeGreaterThan(Date.now())
      expect(tokens.expiresIn).toBeGreaterThan(0)

      // Verify access token
      const accessPayload = await verifyToken(tokens.accessToken, keyPair.publicKey)
      expect(accessPayload.sub).toBe(userId)
      expect(accessPayload.email).toBe(email)
      expect(accessPayload.role).toBe(role)

      // Verify refresh token
      const refreshPayload = await verifyToken(tokens.refreshToken, keyPair.publicKey)
      expect(refreshPayload.sub).toBe(userId)
      expect(refreshPayload.type).toBe('refresh')
    })
  })

  describe('rotateTokens', () => {
    it('should generate new tokens while invalidating old ones', async () => {
      const userId = 'user-123'
      const originalTokens = await generateTokenPair(
        userId,
        'test@example.com',
        'customer',
        deviceFingerprint,
        keyPair.privateKey
      )

      const newTokens = await rotateTokens(
        originalTokens.refreshToken,
        keyPair.publicKey,
        keyPair.privateKey,
        deviceFingerprint
      )

      expect(newTokens.accessToken).toBeDefined()
      expect(newTokens.refreshToken).toBeDefined()
      expect(newTokens.accessToken).not.toBe(originalTokens.accessToken)
      expect(newTokens.refreshToken).not.toBe(originalTokens.refreshToken)

      // Verify new tokens work
      const newAccessPayload = await verifyToken(newTokens.accessToken, keyPair.publicKey)
      expect(newAccessPayload.sub).toBe(userId)
    })

    it('should fail rotation with invalid refresh token', async () => {
      await expect(
        rotateTokens(
          'invalid-token',
          keyPair.publicKey,
          keyPair.privateKey,
          deviceFingerprint
        )
      ).rejects.toThrow()
    })
  })

  describe('token revocation', () => {
    it('should revoke and check token status', async () => {
      const tokenId = 'test-token-id'

      expect(isTokenRevoked(tokenId)).toBe(false)

      revokeToken(tokenId)

      expect(isTokenRevoked(tokenId)).toBe(true)
    })
  })

  describe('extractBearerToken', () => {
    it('should extract token from Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      const header = `Bearer ${token}`

      const extracted = extractBearerToken(header)
      expect(extracted).toBe(token)
    })

    it('should return null for invalid format', () => {
      expect(extractBearerToken('InvalidFormat token')).toBeNull()
      expect(extractBearerToken('Bearer')).toBeNull()
      expect(extractBearerToken('')).toBeNull()
      expect(extractBearerToken(null as any)).toBeNull()
    })
  })

  describe('hashFingerprint', () => {
    it('should generate consistent fingerprint hashes', async () => {
      const hash1 = await hashFingerprint(deviceFingerprint)
      const hash2 = await hashFingerprint(deviceFingerprint)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 hex
    })

    it('should generate different hashes for different fingerprints', async () => {
      const fingerprint2: DeviceFingerprint = {
        ...deviceFingerprint,
        userAgent: 'Different Browser'
      }

      const hash1 = await hashFingerprint(deviceFingerprint)
      const hash2 = await hashFingerprint(fingerprint2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('validateTokenClaims', () => {
    it('should validate valid token claims', () => {
      const claims: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      expect(() => validateTokenClaims(claims)).not.toThrow()
    })

    it('should throw for missing required claims', () => {
      const claims = {
        sub: 'user-123',
        // Missing email, role, etc.
      } as TokenPayload

      expect(() => validateTokenClaims(claims)).toThrow()
    })

    it('should throw for expired claims', () => {
      const claims: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      expect(() => validateTokenClaims(claims)).toThrow('Token expired')
    })

    it('should throw for invalid role', () => {
      const claims: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'invalid-role' as any,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        jti: 'token-id-123',
        deviceId: 'device-123'
      }

      expect(() => validateTokenClaims(claims)).toThrow('Invalid role')
    })
  })
})