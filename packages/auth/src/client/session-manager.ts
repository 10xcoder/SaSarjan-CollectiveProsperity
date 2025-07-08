import { createSecureStorage } from '../utils/storage'
import type { AuthSession, User } from '../types'
import { useAuthStore } from './auth-store'
import { getSessionSecurityEnhancer, type SessionSecurityEnhancer } from './session-security'

interface SessionData {
  session: AuthSession
  expiresAt: number
  lastActivity: number
}

interface SessionManagerConfig {
  storagePrefix?: string
  sessionTimeout?: number // in milliseconds
  activityTimeout?: number // in milliseconds
  refreshThreshold?: number // percentage of session lifetime
}

export class SessionManager {
  private storage: ReturnType<typeof createSecureStorage>
  private config: Required<SessionManagerConfig>
  private refreshTimer?: NodeJS.Timeout
  private activityTimer?: NodeJS.Timeout
  private syncChannel?: BroadcastChannel
  private securityEnhancer: SessionSecurityEnhancer
  
  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      storagePrefix: config.storagePrefix || 'sasarjan-session',
      sessionTimeout: config.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      activityTimeout: config.activityTimeout || 30 * 60 * 1000, // 30 minutes
      refreshThreshold: config.refreshThreshold || 0.8 // 80%
    }
    
    this.storage = createSecureStorage(this.config.storagePrefix)
    this.securityEnhancer = getSessionSecurityEnhancer()
    this.initializeSyncChannel()
    this.restoreSession()
    this.startActivityMonitoring()
  }
  
  private initializeSyncChannel() {
    if (typeof window === 'undefined') return
    
    try {
      this.syncChannel = new BroadcastChannel('sasarjan-session-sync')
      this.syncChannel.addEventListener('message', (event) => {
        this.handleSyncMessage(event.data)
      })
    } catch (error) {
      console.warn('BroadcastChannel not supported, using storage events')
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith(this.config.storagePrefix)) {
          this.handleStorageChange(event)
        }
      })
    }
  }
  
  private handleSyncMessage(message: any) {
    switch (message.type) {
      case 'SESSION_UPDATED':
        this.loadSessionFromStorage()
        break
      case 'SESSION_CLEARED':
        this.clearSession()
        break
      case 'SESSION_REFRESH':
        this.refreshSession()
        break
    }
  }
  
  private handleStorageChange(event: StorageEvent) {
    if (event.key === `${this.config.storagePrefix}-session`) {
      if (event.newValue) {
        this.loadSessionFromStorage()
      } else {
        this.clearSession()
      }
    }
  }
  
  private startActivityMonitoring() {
    if (typeof window === 'undefined') return
    
    const updateActivity = (event: Event) => {
      const sessionData = this.getStoredSession()
      if (sessionData && this.isSessionValid(sessionData)) {
        sessionData.lastActivity = Date.now()
        this.storeSession(sessionData)
        
        // Monitor activity for security
        if (sessionData.session.id) {
          this.securityEnhancer.monitorActivity(sessionData.session.id, event.type)
        }
      }
    }
    
    // Monitor user activity
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })
    
    // Check for inactivity periodically
    this.activityTimer = setInterval(() => {
      const sessionData = this.getStoredSession()
      if (sessionData && !this.isActivityValid(sessionData)) {
        console.warn('Session expired due to inactivity')
        this.clearSession()
      }
    }, 60000) // Check every minute
  }
  
  private isSessionValid(sessionData: SessionData): boolean {
    return Date.now() < sessionData.expiresAt
  }
  
  private isActivityValid(sessionData: SessionData): boolean {
    return Date.now() - sessionData.lastActivity < this.config.activityTimeout
  }
  
  private shouldRefreshSession(sessionData: SessionData): boolean {
    const sessionLifetime = sessionData.expiresAt - (sessionData.session.expires_at || 0)
    const timeElapsed = Date.now() - (sessionData.session.expires_at || 0)
    return timeElapsed / sessionLifetime > this.config.refreshThreshold
  }
  
  private getStoredSession(): SessionData | null {
    try {
      const data = this.storage.getItem('session')
      if (!data) return null
      
      const sessionData = JSON.parse(data) as SessionData
      return sessionData
    } catch (error) {
      console.error('Error parsing stored session:', error)
      return null
    }
  }
  
  private storeSession(sessionData: SessionData) {
    try {
      this.storage.setItem('session', JSON.stringify(sessionData))
      this.broadcastSync('SESSION_UPDATED')
    } catch (error) {
      console.error('Error storing session:', error)
    }
  }
  
  private broadcastSync(type: string) {
    if (this.syncChannel) {
      this.syncChannel.postMessage({ type, timestamp: Date.now() })
    }
  }
  
  private async restoreSession() {
    const sessionData = this.getStoredSession()
    if (sessionData && this.isSessionValid(sessionData) && this.isActivityValid(sessionData)) {
      // Validate session security
      const isSecure = await this.securityEnhancer.validateSession(sessionData.session)
      if (!isSecure) {
        console.warn('Session failed security validation')
        this.clearSession()
        return
      }
      
      const store = useAuthStore.getState()
      store.setSession(sessionData.session)
      this.scheduleRefresh(sessionData)
    } else if (sessionData) {
      // Session invalid, clear it
      this.clearSession()
    }
  }
  
  private loadSessionFromStorage() {
    const sessionData = this.getStoredSession()
    if (sessionData && this.isSessionValid(sessionData)) {
      const store = useAuthStore.getState()
      store.setSession(sessionData.session)
    }
  }
  
  private scheduleRefresh(sessionData: SessionData) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    if (this.shouldRefreshSession(sessionData)) {
      // Refresh immediately if threshold reached
      this.refreshSession()
    } else {
      // Schedule refresh for when threshold will be reached
      const sessionLifetime = sessionData.expiresAt - (sessionData.session.expires_at || 0)
      const refreshTime = sessionLifetime * this.config.refreshThreshold
      const timeUntilRefresh = refreshTime - (Date.now() - (sessionData.session.expires_at || 0))
      
      this.refreshTimer = setTimeout(() => {
        this.refreshSession()
      }, Math.max(timeUntilRefresh, 0))
    }
  }
  
  async saveSession(session: AuthSession) {
    // Validate session security
    const isSecure = await this.securityEnhancer.validateSession(session)
    if (!isSecure) {
      throw new Error('Session failed security validation')
    }
    
    const sessionData: SessionData = {
      session,
      expiresAt: session.expires_at || Date.now() + this.config.sessionTimeout,
      lastActivity: Date.now()
    }
    
    this.storeSession(sessionData)
    this.scheduleRefresh(sessionData)
  }
  
  async refreshSession() {
    const store = useAuthStore.getState()
    const currentSession = store.session
    
    if (!currentSession?.refresh_token) {
      console.warn('No refresh token available')
      return
    }
    
    try {
      // This would call the auth service to refresh
      // For now, we'll just extend the session
      const newSession: AuthSession = {
        ...currentSession,
        expires_at: Date.now() + this.config.sessionTimeout
      }
      
      await this.saveSession(newSession)
      store.setSession(newSession)
      this.broadcastSync('SESSION_REFRESH')
    } catch (error) {
      console.error('Failed to refresh session:', error)
      this.clearSession()
    }
  }
  
  clearSession() {
    const sessionData = this.getStoredSession()
    if (sessionData?.session?.id) {
      this.securityEnhancer.clearSession(sessionData.session.id)
    }
    
    this.storage.removeItem('session')
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }
    
    const store = useAuthStore.getState()
    store.clearAuth()
    
    this.broadcastSync('SESSION_CLEARED')
  }
  
  destroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
    }
    
    if (this.syncChannel) {
      this.syncChannel.close()
    }
  }
}

// Singleton instance
let sessionManager: SessionManager | null = null

export function getSessionManager(config?: SessionManagerConfig): SessionManager {
  if (!sessionManager) {
    sessionManager = new SessionManager(config)
  }
  return sessionManager
}

export function destroySessionManager() {
  if (sessionManager) {
    sessionManager.destroy()
    sessionManager = null
  }
}