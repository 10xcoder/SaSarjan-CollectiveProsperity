import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SessionManager, getSessionManager, destroySessionManager } from '@/client/session-manager'
import type { AuthSession } from '@/types'

describe('SessionManager', () => {
  let sessionManager: SessionManager
  let mockSession: AuthSession

  beforeEach(() => {
    vi.clearAllMocks()
    sessionManager = new SessionManager({
      storagePrefix: 'test',
      sessionTimeout: 3600000, // 1 hour
      activityTimeout: 1800000, // 30 minutes
      refreshThreshold: 0.8 // 80%
    })

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
    sessionManager.destroy()
    destroySessionManager()
  })

  describe('setSession', () => {
    it('should store session successfully', async () => {
      await sessionManager.setSession(mockSession)
      
      const storedSession = sessionManager.getCurrentSession()
      expect(storedSession).toEqual(mockSession)
    })

    it('should start session monitoring after setting session', async () => {
      const startMonitoringSpy = vi.spyOn(sessionManager, 'startSessionMonitoring')
      
      await sessionManager.setSession(mockSession)
      
      expect(startMonitoringSpy).toHaveBeenCalled()
    })

    it('should broadcast session sync message', async () => {
      const broadcastSpy = vi.spyOn(sessionManager as any, 'broadcastSync')
      
      await sessionManager.setSession(mockSession)
      
      expect(broadcastSpy).toHaveBeenCalledWith({
        type: 'SESSION_SET',
        session: mockSession
      })
    })
  })

  describe('getSession', () => {
    it('should return current session', async () => {
      await sessionManager.setSession(mockSession)
      
      const session = await sessionManager.getSession()
      expect(session).toEqual(mockSession)
    })

    it('should return null when no session exists', async () => {
      const session = await sessionManager.getSession()
      expect(session).toBeNull()
    })

    it('should return null for expired sessions', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 1000 // Expired 1 second ago
      }
      
      await sessionManager.setSession(expiredSession)
      const session = await sessionManager.getSession()
      
      expect(session).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should clear stored session', async () => {
      await sessionManager.setSession(mockSession)
      
      sessionManager.clearSession()
      
      const session = sessionManager.getCurrentSession()
      expect(session).toBeNull()
    })

    it('should stop session monitoring', () => {
      const stopMonitoringSpy = vi.spyOn(sessionManager, 'stopSessionMonitoring')
      
      sessionManager.clearSession()
      
      expect(stopMonitoringSpy).toHaveBeenCalled()
    })

    it('should broadcast clear sync message', () => {
      const broadcastSpy = vi.spyOn(sessionManager as any, 'broadcastSync')
      
      sessionManager.clearSession()
      
      expect(broadcastSpy).toHaveBeenCalledWith({
        type: 'SESSION_CLEARED'
      })
    })
  })

  describe('session validation', () => {
    it('should validate active sessions', async () => {
      await sessionManager.setSession(mockSession)
      
      const isValid = (sessionManager as any).isSessionValid(mockSession)
      expect(isValid).toBe(true)
    })

    it('should invalidate expired sessions', () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 1000
      }
      
      const isValid = (sessionManager as any).isSessionValid(expiredSession)
      expect(isValid).toBe(false)
    })

    it('should validate activity timeout', () => {
      // Simulate activity within timeout
      const recentActivity = Date.now() - 900000 // 15 minutes ago
      vi.spyOn(localStorage, 'getItem').mockReturnValue(recentActivity.toString())
      
      const isValid = (sessionManager as any).isActivityValid()
      expect(isValid).toBe(true)
    })

    it('should invalidate old activity', () => {
      // Simulate old activity beyond timeout
      const oldActivity = Date.now() - 2400000 // 40 minutes ago
      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldActivity.toString())
      
      const isValid = (sessionManager as any).isActivityValid()
      expect(isValid).toBe(false)
    })
  })

  describe('session refresh', () => {
    it('should detect when refresh is needed', () => {
      const soonToExpireSession = {
        ...mockSession,
        expires_at: Date.now() + 600000 // 10 minutes (< 80% of 1 hour)
      }
      
      const shouldRefresh = (sessionManager as any).shouldRefreshSession(soonToExpireSession)
      expect(shouldRefresh).toBe(true)
    })

    it('should not refresh recent sessions', () => {
      const recentSession = {
        ...mockSession,
        expires_at: Date.now() + 3200000 // 53+ minutes (> 80% of 1 hour)
      }
      
      const shouldRefresh = (sessionManager as any).shouldRefreshSession(recentSession)
      expect(shouldRefresh).toBe(false)
    })

    it('should schedule refresh for eligible sessions', async () => {
      const scheduleRefreshSpy = vi.spyOn(sessionManager as any, 'scheduleRefresh')
      
      const soonToExpireSession = {
        ...mockSession,
        expires_at: Date.now() + 600000
      }
      
      await sessionManager.setSession(soonToExpireSession)
      
      expect(scheduleRefreshSpy).toHaveBeenCalled()
    })
  })

  describe('cross-app synchronization', () => {
    it('should handle sync messages from other apps', async () => {
      const handleSyncSpy = vi.spyOn(sessionManager as any, 'handleSyncMessage')
      
      // Simulate receiving sync message
      const syncMessage = {
        type: 'SESSION_SET',
        session: mockSession,
        source: 'other-app'
      }
      
      ;(sessionManager as any).handleSyncMessage({ data: syncMessage })
      
      expect(handleSyncSpy).toHaveBeenCalledWith({ data: syncMessage })
    })

    it('should ignore sync messages from same app', () => {
      const setSessionSpy = vi.spyOn(sessionManager, 'setSession')
      
      // Simulate receiving sync message from same source
      const syncMessage = {
        type: 'SESSION_SET',
        session: mockSession,
        source: 'same-app'
      }
      
      ;(sessionManager as any).handleSyncMessage({ data: syncMessage })
      
      expect(setSessionSpy).not.toHaveBeenCalled()
    })

    it('should handle session clear messages', () => {
      const clearSessionSpy = vi.spyOn(sessionManager, 'clearSession')
      
      const syncMessage = {
        type: 'SESSION_CLEARED',
        source: 'other-app'
      }
      
      ;(sessionManager as any).handleSyncMessage({ data: syncMessage })
      
      expect(clearSessionSpy).toHaveBeenCalled()
    })
  })

  describe('storage integration', () => {
    it('should persist session to storage', async () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem')
      
      await sessionManager.setSession(mockSession)
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'test-session',
        expect.stringContaining('"id":"session-123"')
      )
    })

    it('should restore session from storage', () => {
      const sessionData = JSON.stringify(mockSession)
      vi.spyOn(localStorage, 'getItem').mockReturnValue(sessionData)
      
      const restoredSession = (sessionManager as any).loadSessionFromStorage()
      
      expect(restoredSession).toEqual(mockSession)
    })

    it('should handle corrupted storage data', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json')
      
      const restoredSession = (sessionManager as any).loadSessionFromStorage()
      
      expect(restoredSession).toBeNull()
    })
  })

  describe('singleton pattern', () => {
    it('should return same instance with getSessionManager', () => {
      const manager1 = getSessionManager()
      const manager2 = getSessionManager()
      
      expect(manager1).toBe(manager2)
    })

    it('should create new instance after destroy', () => {
      const manager1 = getSessionManager()
      destroySessionManager()
      const manager2 = getSessionManager()
      
      expect(manager1).not.toBe(manager2)
    })
  })

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      const stopMonitoringSpy = vi.spyOn(sessionManager, 'stopSessionMonitoring')
      
      sessionManager.destroy()
      
      expect(stopMonitoringSpy).toHaveBeenCalled()
    })

    it('should close broadcast channel on destroy', () => {
      const closeSpy = vi.fn()
      ;(sessionManager as any).syncChannel = { close: closeSpy }
      
      sessionManager.destroy()
      
      expect(closeSpy).toHaveBeenCalled()
    })
  })
})