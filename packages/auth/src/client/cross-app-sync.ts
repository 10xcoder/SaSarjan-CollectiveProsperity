import type { AuthSession, AuthEvent } from '../types'
import { useAuthStore } from './auth-store'
import { getSessionManager } from './session-manager'

interface CrossAppMessage {
  type: 'AUTH_SYNC' | 'REQUEST_SESSION' | 'PROVIDE_SESSION' | 'SESSION_UPDATE'
  source: string
  target?: string
  payload?: any
  timestamp: number
  nonce: string
}

interface AppRegistration {
  appId: string
  origin: string
  publicKey?: string
  permissions: string[]
}

export class CrossAppSyncService {
  private appId: string
  private trustedApps: Map<string, AppRegistration>
  private messageHandlers: Map<string, (message: CrossAppMessage) => void>
  private syncChannel?: BroadcastChannel
  private pendingRequests: Map<string, (session: AuthSession | null) => void>
  
  constructor(appId: string) {
    this.appId = appId
    this.trustedApps = new Map()
    this.messageHandlers = new Map()
    this.pendingRequests = new Map()
    
    this.initializeMessageHandlers()
    this.initializeSyncChannel()
    this.setupEventListeners()
  }
  
  private initializeMessageHandlers() {
    this.messageHandlers.set('REQUEST_SESSION', this.handleSessionRequest.bind(this))
    this.messageHandlers.set('PROVIDE_SESSION', this.handleSessionProvided.bind(this))
    this.messageHandlers.set('SESSION_UPDATE', this.handleSessionUpdate.bind(this))
  }
  
  private initializeSyncChannel() {
    if (typeof window === 'undefined') return
    
    try {
      this.syncChannel = new BroadcastChannel('sasarjan-cross-app-auth')
      this.syncChannel.addEventListener('message', (event) => {
        this.handleMessage(event.data)
      })
    } catch (error) {
      console.warn('BroadcastChannel not supported for cross-app sync')
      // Fallback to postMessage for iframes
      window.addEventListener('message', (event) => {
        if (this.isValidMessage(event)) {
          this.handleMessage(event.data)
        }
      })
    }
  }
  
  private setupEventListeners() {
    const store = useAuthStore.getState()
    
    // Listen for auth events and sync them
    store.addEventListener((event: AuthEvent) => {
      if (event.type === 'SIGN_IN' || event.type === 'SIGN_OUT' || event.type === 'USER_UPDATED') {
        this.broadcastSessionUpdate()
      }
    })
  }
  
  private isValidMessage(event: MessageEvent): boolean {
    // Validate message origin
    const app = Array.from(this.trustedApps.values()).find(
      app => app.origin === event.origin
    )
    
    return !!app && event.data?.type === 'AUTH_SYNC'
  }
  
  private handleMessage(data: any) {
    if (data.type !== 'AUTH_SYNC') return
    
    const message = data.message as CrossAppMessage
    
    // Ignore our own messages
    if (message.source === this.appId) return
    
    // Check if message is for us
    if (message.target && message.target !== this.appId) return
    
    // Validate trusted app
    if (!this.trustedApps.has(message.source)) {
      console.warn(`Ignoring message from untrusted app: ${message.source}`)
      return
    }
    
    // Handle message
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    }
  }
  
  private handleSessionRequest(message: CrossAppMessage) {
    const store = useAuthStore.getState()
    const session = store.session
    
    // Only provide session if we have one and the app has permission
    const app = this.trustedApps.get(message.source)
    if (app && session && this.hasPermission(app, 'read_session')) {
      this.sendMessage({
        type: 'PROVIDE_SESSION',
        source: this.appId,
        target: message.source,
        payload: { session },
        timestamp: Date.now(),
        nonce: message.nonce
      })
    }
  }
  
  private handleSessionProvided(message: CrossAppMessage) {
    const request = this.pendingRequests.get(message.nonce)
    if (request) {
      request(message.payload?.session || null)
      this.pendingRequests.delete(message.nonce)
    }
  }
  
  private handleSessionUpdate(message: CrossAppMessage) {
    const app = this.trustedApps.get(message.source)
    if (!app || !this.hasPermission(app, 'write_session')) {
      console.warn(`App ${message.source} does not have permission to update session`)
      return
    }
    
    const sessionManager = getSessionManager()
    const newSession = message.payload?.session
    
    if (newSession) {
      sessionManager.saveSession(newSession)
      const store = useAuthStore.getState()
      store.setSession(newSession)
    } else {
      sessionManager.clearSession()
    }
  }
  
  private hasPermission(app: AppRegistration, permission: string): boolean {
    return app.permissions.includes(permission) || app.permissions.includes('*')
  }
  
  private sendMessage(message: CrossAppMessage) {
    const wrappedMessage = {
      type: 'AUTH_SYNC',
      message
    }
    
    if (this.syncChannel) {
      this.syncChannel.postMessage(wrappedMessage)
    }
    
    // Also send via postMessage for iframes
    if (message.target) {
      const targetApp = this.trustedApps.get(message.target)
      if (targetApp && targetApp.origin !== window.location.origin) {
        window.parent.postMessage(wrappedMessage, targetApp.origin)
      }
    }
  }
  
  private generateNonce(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  private broadcastSessionUpdate() {
    const store = useAuthStore.getState()
    
    this.sendMessage({
      type: 'SESSION_UPDATE',
      source: this.appId,
      payload: { session: store.session },
      timestamp: Date.now(),
      nonce: this.generateNonce()
    })
  }
  
  registerApp(registration: AppRegistration) {
    this.trustedApps.set(registration.appId, registration)
  }
  
  unregisterApp(appId: string) {
    this.trustedApps.delete(appId)
  }
  
  async requestSessionFromApps(): Promise<AuthSession | null> {
    const nonce = this.generateNonce()
    
    return new Promise((resolve) => {
      this.pendingRequests.set(nonce, resolve)
      
      this.sendMessage({
        type: 'REQUEST_SESSION',
        source: this.appId,
        timestamp: Date.now(),
        nonce
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(nonce)) {
          this.pendingRequests.delete(nonce)
          resolve(null)
        }
      }, 5000)
    })
  }
  
  subscribeToAuthEvents(handler: (event: AuthEvent) => void): () => void {
    const store = useAuthStore.getState()
    return store.addEventListener(handler)
  }
  
  broadcastAuthEvent(event: AuthEvent) {
    this.broadcast(event)
  }
  
  broadcast(event: AuthEvent) {
    this.sendMessage({
      type: 'SESSION_UPDATE',
      source: this.appId,
      payload: { event },
      timestamp: Date.now(),
      nonce: this.generateNonce()
    })
  }
  
  destroy() {
    if (this.syncChannel) {
      this.syncChannel.close()
    }
    this.trustedApps.clear()
    this.messageHandlers.clear()
    this.pendingRequests.clear()
  }
}

// Factory function for creating cross-app sync service
export function createCrossAppSync(appId: string): CrossAppSyncService {
  return new CrossAppSyncService(appId)
}

// Pre-configured trusted apps for SaSarjan ecosystem
export const SASARJAN_APPS: AppRegistration[] = [
  {
    appId: 'sasarjan-main',
    origin: 'https://sasarjan.com',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'sasarjan-admin',
    origin: 'https://admin.sasarjan.com',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'talentexcel',
    origin: 'https://talentexcel.com',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'sevapremi',
    origin: 'https://sevapremi.com',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: '10xgrowth',
    origin: 'https://10xgrowth.com',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'sasarjan-dev',
    origin: 'http://localhost:3000',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'talentexcel-dev',
    origin: 'http://localhost:3001',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'sevapremi-dev',
    origin: 'http://localhost:3002',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: '10xgrowth-dev',
    origin: 'http://localhost:3003',
    permissions: ['read_session', 'write_session']
  },
  {
    appId: 'admin-dev',
    origin: 'http://localhost:3004',
    permissions: ['read_session', 'write_session']
  }
]