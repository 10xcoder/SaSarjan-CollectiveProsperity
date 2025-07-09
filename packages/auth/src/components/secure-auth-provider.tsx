'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { AuthService } from '../core/auth-service'
import { getSecureTokenManager, type SecureTokenManager } from '../client/secure-token-manager'
import { getSessionManager, type SessionManager } from '../client/session-manager'
import { getSessionSecurityEnhancer, type SessionSecurityEnhancer } from '../client/session-security'
import { createCrossAppSync, type CrossAppSyncService } from '../client/cross-app-sync'
import { useAuthStore } from '../client/auth-store'
import type { User, AuthSession, AuthConfig, AuthState, AuthEvent } from '../types'

export interface SecureAuthConfig extends AuthConfig {
  appId: string
  appName: string
  appUrl: string
  enableFingerprinting?: boolean
  enableTokenRotation?: boolean
  enableCrossAppSync?: boolean
  cookieDomain?: string
  jwtConfig?: {
    algorithm?: 'RS256' | 'ES256'
    issuer?: string
    audience?: string
  }
}

interface SecureAuthContextValue {
  // Auth state
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  
  // Token methods
  getAccessToken: () => Promise<string | null>
  getAuthHeaders: () => Promise<Record<string, string>>
  refreshSession: () => Promise<boolean>
  
  // Security methods
  getCsrfToken: () => string | null
  validateSession: () => Promise<boolean>
  
  // Services
  authService: AuthService
  tokenManager: SecureTokenManager
  sessionManager: SessionManager
  securityEnhancer: SessionSecurityEnhancer
  crossAppSync: CrossAppSyncService | null
}

const SecureAuthContext = createContext<SecureAuthContextValue | null>(null)

export interface SecureAuthProviderProps {
  children: React.ReactNode
  config: SecureAuthConfig
  onAuthStateChange?: (event: AuthEvent) => void
}

export function SecureAuthProvider({ 
  children, 
  config,
  onAuthStateChange
}: SecureAuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Get auth store state and actions
  const { user, session, isLoading, error, setUser, setSession, setLoading, setError, clearAuth } = useAuthStore()
  
  // Initialize services
  const servicesRef = useRef<{
    authService: AuthService
    tokenManager: SecureTokenManager
    sessionManager: SessionManager
    securityEnhancer: SessionSecurityEnhancer
    crossAppSync: CrossAppSyncService | null
  }>()
  
  if (!servicesRef.current) {
    // Create auth service
    const authService = new AuthService(config)
    
    // Create token manager with security features
    const tokenManager = getSecureTokenManager({
      enableFingerprinting: config.enableFingerprinting ?? true,
      autoRotation: config.enableTokenRotation ?? true,
      cookieDomain: config.cookieDomain,
      jwtConfig: config.jwtConfig
    })
    
    // Create session manager
    const sessionManager = getSessionManager()
    
    // Create security enhancer
    const securityEnhancer = getSessionSecurityEnhancer()
    
    // Create cross-app sync if enabled
    const crossAppSync = config.enableCrossAppSync
      ? createCrossAppSync(config.appId)
      : null
    
    servicesRef.current = {
      authService,
      tokenManager,
      sessionManager,
      securityEnhancer,
      crossAppSync
    }
  }
  
  const services = servicesRef.current
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Check for existing session
        const existingSession = services.sessionManager.getCurrentSession()
        if (existingSession) {
          // Validate session
          const isValid = await services.tokenManager.validateCurrentSession()
          if (isValid) {
            setSession(existingSession)
            setUser(existingSession.user)
            
            // Start session monitoring
            // Session monitoring already started in constructor
          } else {
            // Try to refresh
            const refreshed = await services.tokenManager.refreshSession()
            if (refreshed) {
              const newSession = services.sessionManager.getCurrentSession()
              if (newSession) {
                setSession(newSession)
                setUser(newSession.user)
              }
            }
          }
        }
        
        // Set up cross-app sync
        if (services.crossAppSync) {
          services.crossAppSync.subscribeToAuthEvents((event: AuthEvent) => {
            switch (event.type) {
              case 'SIGN_IN':
                setSession(event.payload)
                setUser(event.payload.user)
                break
              case 'SIGN_OUT':
                clearAuth()
                break
              case 'USER_UPDATED':
                setUser(event.payload)
                break
            }
            
            // Notify parent component
            onAuthStateChange?.(event)
          })
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize auth')
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()
    
    // Cleanup
    return () => {
      // Cleanup handled by service destructors
    }
  }, [])
  
  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Sign in with auth service
      const authSession = await services.authService.signIn({ email, password })
      
      if (!authSession) {
        throw new Error('Sign in failed')
      }
      
      // Create secure session
      const secureSession = await services.tokenManager.createSession(authSession.user, {
        loginMethod: 'email',
        timestamp: new Date().toISOString()
      })
      
      // Store session
      await services.sessionManager.setSession(secureSession)
      
      // Update state
      setUser(authSession.user)
      setSession(secureSession)
      
      // Start monitoring
      services.sessionManager.startSessionMonitoring()
      services.securityEnhancer.startMonitoring()
      
      // Broadcast to other apps
      services.crossAppSync?.broadcast({
        type: 'SIGN_IN',
        payload: secureSession
      })
      
      // Notify parent
      onAuthStateChange?.({ type: 'SIGN_IN', payload: secureSession })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [onAuthStateChange])
  
  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      // Sign up with auth service
      const authSession = await services.authService.signUp({ 
        email, 
        password,
        metadata 
      })
      
      if (!authSession) {
        throw new Error('Sign up failed')
      }
      
      // Create secure session
      const secureSession = await services.tokenManager.createSession(authSession.user, {
        loginMethod: 'email',
        isNewUser: true,
        timestamp: new Date().toISOString()
      })
      
      // Store session
      await services.sessionManager.setSession(secureSession)
      
      // Update state
      setUser(authSession.user)
      setSession(secureSession)
      
      // Start monitoring
      services.sessionManager.startSessionMonitoring()
      services.securityEnhancer.startMonitoring()
      
      // Broadcast to other apps
      services.crossAppSync?.broadcast({
        type: 'SIGN_IN',
        payload: secureSession
      })
      
      // Notify parent
      onAuthStateChange?.({ type: 'SIGN_IN', payload: secureSession })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [onAuthStateChange])
  
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      
      // Sign out from auth service
      await services.authService.signOut()
      
      // Clear session
      await services.sessionManager.clearSession()
      
      // Logout from token manager
      await services.tokenManager.logout()
      
      // Stop monitoring
      services.sessionManager.stopSessionMonitoring()
      services.securityEnhancer.stopMonitoring()
      
      // Reset state
      clearAuth()
      
      // Broadcast to other apps
      services.crossAppSync?.broadcast({
        type: 'SIGN_OUT',
        payload: null
      })
      
      // Notify parent
      onAuthStateChange?.({ type: 'SIGN_OUT', payload: null })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [onAuthStateChange])
  
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await services.authService.resetPassword({ email })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await services.authService.updatePassword(newPassword)
      
      // Update user if returned
      if (result.user) {
        setUser(result.user)
        
        // Broadcast update
        services.crossAppSync?.broadcast({
          type: 'USER_UPDATED',
          payload: result.user
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password update failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedUser = await services.authService.updateProfile(updates)
      setUser(updatedUser)
      
      // Broadcast update
      services.crossAppSync?.broadcast({
        type: 'USER_UPDATED',
        payload: updatedUser
      })
      
      // Notify parent
      onAuthStateChange?.({ type: 'USER_UPDATED', payload: updatedUser })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [onAuthStateChange])
  
  const getAccessToken = useCallback(async () => {
    return services.tokenManager.getAccessToken()
  }, [])
  
  const getAuthHeaders = useCallback(async () => {
    return services.tokenManager.getAuthHeaders()
  }, [])
  
  const refreshSession = useCallback(async () => {
    try {
      const success = await services.tokenManager.refreshSession()
      if (success) {
        const newSession = await services.sessionManager.getSession()
        if (newSession) {
          setSession(newSession)
          
          // Broadcast refresh
          services.crossAppSync?.broadcast({
            type: 'TOKEN_REFRESHED',
            payload: {
              access_token: newSession.access_token,
              expires_at: newSession.expires_at
            }
          })
        }
      }
      return success
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }, [])
  
  const getCsrfToken = useCallback(() => {
    return services.tokenManager.getCsrfToken()
  }, [])
  
  const validateSession = useCallback(async () => {
    const payload = await services.tokenManager.validateCurrentSession()
    return payload !== null
  }, [])
  
  // Create context value
  const contextValue: SecureAuthContextValue = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading: isLoading || !isInitialized,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getAccessToken,
    getAuthHeaders,
    refreshSession,
    getCsrfToken,
    validateSession,
    ...services
  }
  
  return (
    <SecureAuthContext.Provider value={contextValue}>
      {children}
    </SecureAuthContext.Provider>
  )
}

// Hook to use auth context
export function useSecureAuth() {
  const context = useContext(SecureAuthContext)
  if (!context) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider')
  }
  return context
}

// Convenience hooks
export function useUser() {
  const { user } = useSecureAuth()
  return user
}

export function useSession() {
  const { session } = useSecureAuth()
  return session
}

export function useAuthHeaders() {
  const { getAuthHeaders } = useSecureAuth()
  const [headers, setHeaders] = useState<Record<string, string>>({})
  
  useEffect(() => {
    getAuthHeaders().then(setHeaders)
  }, [getAuthHeaders])
  
  return headers
}

export function useCsrfToken() {
  const { getCsrfToken } = useSecureAuth()
  return getCsrfToken()
}

// Protected route component
export interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, fallback, redirectTo }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSecureAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, redirectTo])
  
  if (isLoading) {
    return <>{fallback || <div>Loading...</div>}</>
  }
  
  if (!isAuthenticated) {
    return <>{fallback || null}</>
  }
  
  return <>{children}</>
}