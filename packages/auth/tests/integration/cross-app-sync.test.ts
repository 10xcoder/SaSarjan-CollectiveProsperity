import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SecureCrossAppSyncService, createSecureCrossAppSync } from '@/client/secure-cross-app-sync'
import type { SecureCrossAppConfig } from '@/client/secure-cross-app-sync'
import type { AuthSession } from '@/types'

describe('Cross-App Sync Integration', () => {
  let syncService: SecureCrossAppSyncService
  let mockSession: AuthSession
  let config: SecureCrossAppConfig

  beforeEach(() => {
    vi.clearAllMocks()
    
    config = {
      appId: 'test-app',
      hmacSecret: 'test-hmac-secret-key-minimum-32-chars',
      trustedApps: ['web', 'admin', 'talentexcel'],
      enableEncryption: true,
      messageTimeout: 5000,
      replayWindowMs: 300000, // 5 minutes
      maxRetries: 3
    }

    syncService = createSecureCrossAppSync(config)

    mockSession = {
      id: 'session-123',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'customer',
        wallet_balance: 0,
        kyc_status: 'pending',
        preferred_language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-123',
      expires_at: Date.now() + 3600000,
      expires_in: 3600
    }
  })

  afterEach(() => {
    syncService.destroy()
  })

  describe('Secure Message Broadcasting', () => {
    it('should broadcast signed messages to other apps', async () => {
      const postMessageSpy = vi.fn()
      const mockChannel = {
        postMessage: postMessageSpy,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close: vi.fn()
      }
      
      // Mock BroadcastChannel
      vi.mocked(BroadcastChannel).mockImplementation(() => mockChannel as any)

      const newSyncService = createSecureCrossAppSync(config)
      
      await newSyncService.broadcastAuthEvent({
        type: 'SIGN_IN',
        payload: mockSession
      })

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            type: 'SIGN_IN',
            payload: mockSession
          }),
          signature: expect.stringMatching(/^[0-9a-f]{64}$/), // HMAC signature
          timestamp: expect.any(Number),
          nonce: expect.any(String),
          appId: 'test-app'
        })
      )
    })

    it('should encrypt sensitive message content', async () => {
      const postMessageSpy = vi.fn()
      const mockChannel = {
        postMessage: postMessageSpy,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close: vi.fn()
      }
      
      vi.mocked(BroadcastChannel).mockImplementation(() => mockChannel as any)

      const newSyncService = createSecureCrossAppSync(config)
      
      await newSyncService.broadcastAuthEvent({
        type: 'SIGN_IN',
        payload: mockSession
      })

      const broadcastedMessage = postMessageSpy.mock.calls[0][0]
      
      // Message payload should be encrypted (not plain text)
      expect(JSON.stringify(broadcastedMessage.message.payload)).not.toContain(mockSession.access_token)
    })

    it('should include replay protection nonce', async () => {
      const postMessageSpy = vi.fn()
      const mockChannel = {
        postMessage: postMessageSpy,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close: vi.fn()
      }
      
      vi.mocked(BroadcastChannel).mockImplementation(() => mockChannel as any)

      const newSyncService = createSecureCrossAppSync(config)
      
      await newSyncService.broadcastAuthEvent({
        type: 'SIGN_IN',
        payload: mockSession
      })

      const broadcastedMessage = postMessageSpy.mock.calls[0][0]
      
      expect(broadcastedMessage.nonce).toBeDefined()
      expect(typeof broadcastedMessage.nonce).toBe('string')
      expect(broadcastedMessage.nonce.length).toBeGreaterThan(0)
    })
  })

  describe('Message Verification', () => {
    it('should verify valid incoming messages', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      // Create a properly signed message
      const signedMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'web',
        timestamp: Date.now()
      })

      // Simulate receiving the message
      const messageEvent = {
        data: {
          ...signedMessage,
          appId: 'web'
        }
      }

      await (syncService as any).handleMessage(messageEvent)

      expect(handler).toHaveBeenCalledWith({
        type: 'SIGN_IN',
        payload: mockSession
      })
    })

    it('should reject messages with invalid signatures', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const invalidMessage = {
        message: {
          type: 'SIGN_IN',
          payload: mockSession,
          appId: 'web',
          timestamp: Date.now()
        },
        signature: 'invalid-signature',
        nonce: 'test-nonce',
        appId: 'web'
      }

      await (syncService as any).handleMessage({ data: invalidMessage })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should reject messages from untrusted apps', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const signedMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'untrusted-app',
        timestamp: Date.now()
      })

      const messageEvent = {
        data: {
          ...signedMessage,
          appId: 'untrusted-app'
        }
      }

      await (syncService as any).handleMessage(messageEvent)

      expect(handler).not.toHaveBeenCalled()
    })

    it('should reject expired messages', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const expiredMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'web',
        timestamp: Date.now() - 400000 // 6+ minutes ago (beyond 5 min window)
      })

      const messageEvent = {
        data: {
          ...expiredMessage,
          appId: 'web'
        }
      }

      await (syncService as any).handleMessage(messageEvent)

      expect(handler).not.toHaveBeenCalled()
    })

    it('should reject replayed messages', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const signedMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'web',
        timestamp: Date.now()
      })

      const messageEvent = {
        data: {
          ...signedMessage,
          appId: 'web'
        }
      }

      // First message should be accepted
      await (syncService as any).handleMessage(messageEvent)
      expect(handler).toHaveBeenCalledTimes(1)

      // Second identical message should be rejected (replay attack)
      await (syncService as any).handleMessage(messageEvent)
      expect(handler).toHaveBeenCalledTimes(1) // No additional calls
    })
  })

  describe('Event Handling', () => {
    it('should handle SIGN_IN events', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const signedMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'web',
        timestamp: Date.now()
      })

      await (syncService as any).handleMessage({
        data: { ...signedMessage, appId: 'web' }
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'SIGN_IN',
        payload: mockSession
      })
    })

    it('should handle SIGN_OUT events', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const signedMessage = await syncService.signMessage({
        type: 'SIGN_OUT',
        payload: null,
        appId: 'web',
        timestamp: Date.now()
      })

      await (syncService as any).handleMessage({
        data: { ...signedMessage, appId: 'web' }
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'SIGN_OUT',
        payload: null
      })
    })

    it('should handle TOKEN_REFRESHED events', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const tokenData = {
        access_token: 'new-access-token',
        expires_at: Date.now() + 3600000
      }

      const signedMessage = await syncService.signMessage({
        type: 'TOKEN_REFRESHED',
        payload: tokenData,
        appId: 'web',
        timestamp: Date.now()
      })

      await (syncService as any).handleMessage({
        data: { ...signedMessage, appId: 'web' }
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'TOKEN_REFRESHED',
        payload: tokenData
      })
    })

    it('should support multiple event handlers', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      syncService.onAuthEvent(handler1)
      syncService.onAuthEvent(handler2)

      const signedMessage = await syncService.signMessage({
        type: 'SIGN_IN',
        payload: mockSession,
        appId: 'web',
        timestamp: Date.now()
      })

      await (syncService as any).handleMessage({
        data: { ...signedMessage, appId: 'web' }
      })

      expect(handler1).toHaveBeenCalledWith({
        type: 'SIGN_IN',
        payload: mockSession
      })
      expect(handler2).toHaveBeenCalledWith({
        type: 'SIGN_IN',
        payload: mockSession
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle decryption errors gracefully', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const malformedMessage = {
        message: {
          type: 'SIGN_IN',
          payload: 'invalid-encrypted-data',
          appId: 'web',
          timestamp: Date.now()
        },
        signature: 'invalid-signature',
        nonce: 'test-nonce',
        appId: 'web'
      }

      // Should not throw error
      await expect(
        (syncService as any).handleMessage({ data: malformedMessage })
      ).resolves.toBeUndefined()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle invalid message formats', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const invalidMessage = {
        not: 'a valid message format'
      }

      await expect(
        (syncService as any).handleMessage({ data: invalidMessage })
      ).resolves.toBeUndefined()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle missing required fields', async () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      const incompleteMessage = {
        message: {
          type: 'SIGN_IN'
          // Missing payload, appId, timestamp
        },
        signature: 'some-signature',
        nonce: 'test-nonce'
      }

      await expect(
        (syncService as any).handleMessage({ data: incompleteMessage })
      ).resolves.toBeUndefined()

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const mockChannel = {
        close: vi.fn(),
        removeEventListener: vi.fn(),
        postMessage: vi.fn(),
        addEventListener: vi.fn()
      }

      // Replace the channel
      ;(syncService as any).channel = mockChannel

      syncService.destroy()

      expect(mockChannel.close).toHaveBeenCalled()
      expect(mockChannel.removeEventListener).toHaveBeenCalled()
    })

    it('should remove event handlers on destroy', () => {
      const handler = vi.fn()
      syncService.onAuthEvent(handler)

      syncService.destroy()

      // Check that handlers array is cleared
      expect((syncService as any).handlers).toHaveLength(0)
    })
  })
})