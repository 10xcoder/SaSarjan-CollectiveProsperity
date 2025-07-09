import { createHash } from 'crypto'
import type { AuthSession } from '../types'

interface DeviceFingerprint {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  colorDepth: number
  platform: string
  hardwareConcurrency: number
  deviceMemory?: number
  webGLVendor?: string
  webGLRenderer?: string
}

interface SessionSecurityData {
  fingerprint: string
  ipAddress?: string
  lastRotation: number
  rotationCount: number
  anomalyScore: number
  trustLevel: 'high' | 'medium' | 'low'
}

interface SecurityConfig {
  enableTokenRotation?: boolean
  rotationInterval?: number // milliseconds
  enableIPValidation?: boolean
  enableFingerprinting?: boolean
  maxAnomalyScore?: number
  enableActivityMonitoring?: boolean
}

export class SessionSecurityEnhancer {
  private config: Required<SecurityConfig>
  private sessionSecurityMap: Map<string, SessionSecurityData> = new Map()
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map()
  
  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableTokenRotation: config.enableTokenRotation ?? true,
      rotationInterval: config.rotationInterval ?? 15 * 60 * 1000, // 15 minutes
      enableIPValidation: config.enableIPValidation ?? true,
      enableFingerprinting: config.enableFingerprinting ?? true,
      maxAnomalyScore: config.maxAnomalyScore ?? 5,
      enableActivityMonitoring: config.enableActivityMonitoring ?? true
    }
  }
  
  /**
   * Generate device fingerprint
   */
  private async generateFingerprint(): Promise<DeviceFingerprint> {
    if (typeof window === 'undefined') {
      throw new Error('Device fingerprinting requires browser environment')
    }
    
    const fingerprint: DeviceFingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      colorDepth: screen.colorDepth,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory,
    }
    
    // Get WebGL fingerprint if available
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          fingerprint.webGLVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          fingerprint.webGLRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
      }
    } catch (e) {
      // WebGL not available
    }
    
    return fingerprint
  }
  
  /**
   * Hash the fingerprint for storage
   */
  private hashFingerprint(fingerprint: DeviceFingerprint): string {
    const data = JSON.stringify(fingerprint)
    // In a real implementation, use proper crypto
    return btoa(data).slice(0, 32)
  }
  
  /**
   * Get client IP address (requires server cooperation)
   */
  private async getClientIP(): Promise<string | undefined> {
    if (!this.config.enableIPValidation) return undefined
    
    try {
      // This would typically call an API endpoint that returns the client IP
      const response = await fetch('/api/auth/client-ip')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.warn('Failed to get client IP:', error)
      return undefined
    }
  }
  
  /**
   * Validate session security
   */
  async validateSession(session: AuthSession): Promise<boolean> {
    const sessionId = session.id
    const securityData = this.sessionSecurityMap.get(sessionId)
    
    if (!securityData) {
      // First time seeing this session, initialize security
      await this.initializeSessionSecurity(session)
      return true
    }
    
    let anomalyScore = 0
    
    // Check device fingerprint
    if (this.config.enableFingerprinting) {
      const currentFingerprint = await this.generateFingerprint()
      const currentHash = this.hashFingerprint(currentFingerprint)
      
      if (currentHash !== securityData.fingerprint) {
        anomalyScore += 3
        console.warn('Device fingerprint mismatch detected')
      }
    }
    
    // Check IP address
    if (this.config.enableIPValidation && securityData.ipAddress) {
      const currentIP = await this.getClientIP()
      if (currentIP && currentIP !== securityData.ipAddress) {
        anomalyScore += 2
        console.warn('IP address change detected')
      }
    }
    
    // Update anomaly score
    securityData.anomalyScore = anomalyScore
    
    // Determine trust level
    if (anomalyScore === 0) {
      securityData.trustLevel = 'high'
    } else if (anomalyScore < 3) {
      securityData.trustLevel = 'medium'
    } else {
      securityData.trustLevel = 'low'
    }
    
    // Reject if anomaly score too high
    if (anomalyScore > this.config.maxAnomalyScore) {
      console.error('Session security validation failed: anomaly score too high')
      return false
    }
    
    this.sessionSecurityMap.set(sessionId, securityData)
    return true
  }
  
  /**
   * Initialize security for a new session
   */
  private async initializeSessionSecurity(session: AuthSession) {
    const fingerprint = await this.generateFingerprint()
    const ipAddress = await this.getClientIP()
    
    const securityData: SessionSecurityData = {
      fingerprint: this.hashFingerprint(fingerprint),
      ipAddress,
      lastRotation: Date.now(),
      rotationCount: 0,
      anomalyScore: 0,
      trustLevel: 'high'
    }
    
    this.sessionSecurityMap.set(session.id, securityData)
    
    // Schedule token rotation if enabled
    if (this.config.enableTokenRotation) {
      this.scheduleTokenRotation(session.id)
    }
  }
  
  /**
   * Schedule automatic token rotation
   */
  private scheduleTokenRotation(sessionId: string) {
    // Clear existing timer if any
    const existingTimer = this.rotationTimers.get(sessionId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    const timer = setTimeout(() => {
      this.rotateSessionToken(sessionId)
    }, this.config.rotationInterval)
    
    this.rotationTimers.set(sessionId, timer)
  }
  
  /**
   * Rotate session token
   */
  async rotateSessionToken(sessionId: string): Promise<string | null> {
    const securityData = this.sessionSecurityMap.get(sessionId)
    if (!securityData) return null
    
    try {
      // Call API to rotate token
      const response = await fetch('/api/auth/rotate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })
      
      if (!response.ok) {
        throw new Error('Token rotation failed')
      }
      
      const { newToken } = await response.json()
      
      // Update security data
      securityData.lastRotation = Date.now()
      securityData.rotationCount++
      this.sessionSecurityMap.set(sessionId, securityData)
      
      // Schedule next rotation
      this.scheduleTokenRotation(sessionId)
      
      return newToken
    } catch (error) {
      console.error('Failed to rotate token:', error)
      return null
    }
  }
  
  /**
   * Monitor session activity for anomalies
   */
  monitorActivity(sessionId: string, activity: string) {
    if (!this.config.enableActivityMonitoring) return
    
    const securityData = this.sessionSecurityMap.get(sessionId)
    if (!securityData) return
    
    // Simple anomaly detection based on activity patterns
    // In a real implementation, this would use ML models
    const now = Date.now()
    const timeSinceLastActivity = now - securityData.lastRotation
    
    // Detect rapid activity (possible bot)
    if (timeSinceLastActivity < 100) {
      securityData.anomalyScore += 0.5
    }
    
    // Detect unusual activity patterns
    if (activity.includes('admin') && securityData.trustLevel !== 'high') {
      securityData.anomalyScore += 1
    }
    
    this.sessionSecurityMap.set(sessionId, securityData)
  }
  
  /**
   * Get session security status
   */
  getSecurityStatus(sessionId: string): SessionSecurityData | null {
    return this.sessionSecurityMap.get(sessionId) || null
  }
  
  /**
   * Start monitoring (placeholder - already auto-started)
   */
  startMonitoring() {
    // Monitoring is already active
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    // Clear all timers
    for (const timer of this.rotationTimers.values()) {
      clearTimeout(timer)
    }
    this.rotationTimers.clear()
  }
  
  /**
   * Clean up session security data
   */
  clearSession(sessionId: string) {
    this.sessionSecurityMap.delete(sessionId)
    
    const timer = this.rotationTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
      this.rotationTimers.delete(sessionId)
    }
  }
  
  /**
   * Clean up all resources
   */
  destroy() {
    this.sessionSecurityMap.clear()
    
    for (const timer of this.rotationTimers.values()) {
      clearTimeout(timer)
    }
    this.rotationTimers.clear()
  }
}

// Export singleton instance
let securityEnhancer: SessionSecurityEnhancer | null = null

export function getSessionSecurityEnhancer(config?: SecurityConfig): SessionSecurityEnhancer {
  if (!securityEnhancer) {
    securityEnhancer = new SessionSecurityEnhancer(config)
  }
  return securityEnhancer
}

export function destroySessionSecurityEnhancer() {
  if (securityEnhancer) {
    securityEnhancer.destroy()
    securityEnhancer = null
  }
}