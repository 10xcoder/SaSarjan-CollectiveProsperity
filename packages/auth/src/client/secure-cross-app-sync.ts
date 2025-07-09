import type { AuthSession, AuthEvent } from '../types'
import { useAuthStore } from './auth-store'
import { getSessionManager } from './session-manager'
import { getHMACValidator, type SignedMessage } from '../utils/hmac'
import { getNonceManager } from '../utils/nonce-manager'

interface SecureCrossAppMessage extends SignedMessage {
  type: 'AUTH_SYNC' | 'REQUEST_SESSION' | 'PROVIDE_SESSION' | 'SESSION_UPDATE' | 'KEY_EXCHANGE'
  source: string
  target?: string
  publicKey?: string
}

interface AppRegistration {
  appId: string
  origin: string
  publicKey?: string
  permissions: string[]
  sharedSecret?: string
}

export interface SecureCrossAppConfig {
  appId: string
  hmacSecret?: string
  enableEncryption?: boolean
  maxMessageAge?: number // milliseconds
}

export class SecureCrossAppSyncService {
  private appId: string
  private trustedApps: Map<string, AppRegistration>
  private messageHandlers: Map<string, (message: SecureCrossAppMessage) => void>
  private syncChannel?: BroadcastChannel
  private pendingRequests: Map<string, (session: AuthSession | null) => void>
  private hmacValidator: ReturnType<typeof getHMACValidator>
  private nonceManager: ReturnType<typeof getNonceManager>
  private config: SecureCrossAppConfig
  
  constructor(config: SecureCrossAppConfig) {
    this.appId = config.appId
    this.config = config
    this.trustedApps = new Map()
    this.messageHandlers = new Map()
    this.pendingRequests = new Map()
    
    // Initialize security components
    this.hmacValidator = getHMACValidator({ secret: config.hmacSecret })
    this.nonceManager = getNonceManager({ maxAge: config.maxMessageAge || 5 * 60 * 1000 })
    
    this.initializeMessageHandlers()
    this.initializeSyncChannel()
    this.setupEventListeners()
    this.registerDefaultApps()
  }
  
  private initializeMessageHandlers() {
    this.messageHandlers.set('REQUEST_SESSION', this.handleSessionRequest.bind(this))
    this.messageHandlers.set('PROVIDE_SESSION', this.handleSessionProvided.bind(this))
    this.messageHandlers.set('SESSION_UPDATE', this.handleSessionUpdate.bind(this))
    this.messageHandlers.set('KEY_EXCHANGE', this.handleKeyExchange.bind(this))
  }
  
  private initializeSyncChannel() {
    if (typeof window === 'undefined') return
    
    try {
      this.syncChannel = new BroadcastChannel('sasarjan-secure-cross-app-auth')
      this.syncChannel.addEventListener('message', async (event) => {
        await this.handleMessage(event.data)
      })
    } catch (error) {
      console.warn('BroadcastChannel not supported for cross-app sync')
      // Fallback to postMessage for iframes
      window.addEventListener('message', async (event) => {
        if (await this.isValidMessage(event)) {
          await this.handleMessage(event.data)
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
  
  private registerDefaultApps() {
    // Register known SaSarjan apps with their public keys
    const defaultApps: AppRegistration[] = [
      {
        appId: 'sasarjan-web',
        origin: process.env.NEXT_PUBLIC_WEB_URL || 'https://sasarjan.com',
        permissions: ['read_session', 'write_session']
      },
      {
        appId: 'sasarjan-admin',
        origin: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.sasarjan.com',
        permissions: ['read_session', 'write_session']
      },
      {
        appId: 'talentexcel',
        origin: process.env.NEXT_PUBLIC_TALENTEXCEL_URL || 'https://talentexcel.com',
        permissions: ['read_session', 'write_session']
      },
      {
        appId: 'sevapremi',
        origin: process.env.NEXT_PUBLIC_SEVAPREMI_URL || 'https://sevapremi.com',
        permissions: ['read_session', 'write_session']
      },
      {
        appId: '10xgrowth',
        origin: process.env.NEXT_PUBLIC_10XGROWTH_URL || 'https://10xgrowth.com',
        permissions: ['read_session', 'write_session']
      }
    ]
    
    // Add development URLs if in development
    if (process.env.NODE_ENV === 'development') {
      defaultApps.push(
        { appId: 'sasarjan-web-dev', origin: 'http://localhost:3000', permissions: ['read_session', 'write_session'] },
        { appId: 'talentexcel-dev', origin: 'http://localhost:3001', permissions: ['read_session', 'write_session'] },
        { appId: 'sevapremi-dev', origin: 'http://localhost:3002', permissions: ['read_session', 'write_session'] },
        { appId: '10xgrowth-dev', origin: 'http://localhost:3003', permissions: ['read_session', 'write_session'] },
        { appId: 'admin-dev', origin: 'http://localhost:3004', permissions: ['read_session', 'write_session'] }
      )
    }
    
    defaultApps.forEach(app => this.registerApp(app))
  }
  
  private async isValidMessage(event: MessageEvent): Promise<boolean> {
    // Validate message origin
    const app = Array.from(this.trustedApps.values()).find(
      app => app.origin === event.origin
    )
    
    return !!app && event.data?.type === 'AUTH_SYNC'
  }
  
  private async handleMessage(data: any) {
    if (data.type !== 'AUTH_SYNC') return
    
    const message = data.message as SecureCrossAppMessage
    
    // Ignore our own messages
    if (message.source === this.appId) return
    
    // Check if message is for us
    if (message.target && message.target !== this.appId) return
    
    // Validate trusted app
    if (!this.trustedApps.has(message.source)) {
      console.warn(`Ignoring message from untrusted app: ${message.source}`)
      return
    }
    
    // Verify HMAC signature
    if (!await this.hmacValidator.verify(message)) {
      console.warn(`Invalid HMAC signature from app: ${message.source}`)
      return
    }
    
    // Check message age
    if (Date.now() - message.timestamp > (this.config.maxMessageAge || 5 * 60 * 1000)) {
      console.warn(`Message too old from app: ${message.source}`)
      return
    }
    
    // Validate nonce to prevent replay attacks
    if (!this.nonceManager.validateAndConsume(message.nonce)) {
      console.warn(`Duplicate nonce detected from app: ${message.source}`)
      return
    }
    
    // Handle message
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    }
  }
  
  private handleSessionRequest(message: SecureCrossAppMessage) {
    const store = useAuthStore.getState()
    const session = store.session
    
    // Only provide session if we have one and the app has permission
    const app = this.trustedApps.get(message.source)
    if (app && session && this.hasPermission(app, 'read_session')) {
      this.sendSecureMessage({
        type: 'PROVIDE_SESSION',
        source: this.appId,
        target: message.source,
        payload: { session },
        appId: this.appId,
        timestamp: Date.now(),
        nonce: message.nonce // Use same nonce for response correlation
      })
    }
  }
  
  private handleSessionProvided(message: SecureCrossAppMessage) {
    const request = this.pendingRequests.get(message.nonce)
    if (request) {
      request(message.payload?.session || null)
      this.pendingRequests.delete(message.nonce)
    }
  }
  
  private handleSessionUpdate(message: SecureCrossAppMessage) {
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
  
  private handleKeyExchange(message: SecureCrossAppMessage) {
    const app = this.trustedApps.get(message.source)
    if (!app) return
    
    // Store the public key for future encrypted communications
    if (message.publicKey) {
      app.publicKey = message.publicKey
      this.trustedApps.set(message.source, app)
    }
  }
  
  private hasPermission(app: AppRegistration, permission: string): boolean {
    return app.permissions.includes(permission) || app.permissions.includes('*')
  }
  
  private async sendSecureMessage(message: Omit<SecureCrossAppMessage, 'signature'>) {
    // Create signed message
    const signedMessage = await this.hmacValidator.createSignedMessage(
      message.payload,
      message.appId || this.appId
    )
    
    const fullMessage: SecureCrossAppMessage = {
      ...message,
      ...signedMessage
    }
    
    const wrappedMessage = {
      type: 'AUTH_SYNC',
      message: fullMessage
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
    
    this.sendSecureMessage({
      type: 'SESSION_UPDATE',
      source: this.appId,
      payload: { session: store.session },
      appId: this.appId,
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
      
      this.sendSecureMessage({
        type: 'REQUEST_SESSION',
        source: this.appId,
        appId: this.appId,
        timestamp: Date.now(),
        nonce,
        payload: null
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
  
  // Maintain compatibility with existing interface
  subscribeToAuthEvents(handler: (event: AuthEvent) => void): () => void {
    const store = useAuthStore.getState()
    return store.addEventListener(handler)
  }
  
  broadcastAuthEvent(event: AuthEvent) {
    this.sendSecureMessage({
      type: 'SESSION_UPDATE',
      source: this.appId,
      appId: this.appId,
      payload: { event },
      timestamp: Date.now(),
      nonce: this.generateNonce()
    })
  }
  
  broadcast(event: AuthEvent) {
    this.broadcastAuthEvent(event)
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

// Factory function for creating secure cross-app sync service
export function createSecureCrossAppSync(config: SecureCrossAppConfig): SecureCrossAppSyncService {
  return new SecureCrossAppSyncService(config)
}