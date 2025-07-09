'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthService } from '../core/auth-service'
import { getSecureTokenManager } from '../client/secure-token-manager'
import { getEncryptedTokenManager } from '../client/encrypted-token-manager'
import { useAuthStore } from '../client/auth-store'
import { getSessionManager } from '../client/session-manager'
import { createCrossAppSync } from '../client/cross-app-sync'
import { createSecureCrossAppSync } from '../client/secure-cross-app-sync'
import type { User, AuthSession, AuthConfig, AuthEvent } from '../types'

export interface UnifiedAuthConfig extends AuthConfig {
  appId: string
  appName: string
  appUrl: string
  useSecureTokens?: boolean
  enableCrossAppSync?: boolean
  enableSecureCrossAppSync?: boolean
  cookieDomain?: string
  hmacSecret?: string
}

interface UnifiedAuthContextValue {
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
  
  // Token methods
  getAccessToken: () => Promise<string | null>
  getAuthHeaders: () => Promise<Record<string, string>>
  getCsrfToken: () => string | null
}

const UnifiedAuthContext = createContext<UnifiedAuthContextValue | null>(null)

export interface UnifiedAuthProviderProps {
  children: React.ReactNode
  config: UnifiedAuthConfig
  onAuthStateChange?: (event: AuthEvent) => void
}

export function UnifiedAuthProvider({ 
  children, 
  config,
  onAuthStateChange
}: UnifiedAuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Get auth store
  const store = useAuthStore()
  const { user, session, isLoading, error, setUser, setSession, setLoading, setError, clearAuth } = store
  
  // Initialize services
  const [services] = useState(() => {
    const authService = new AuthService(config)
    
    const tokenManager = config.useSecureTokens
      ? getSecureTokenManager({
          enableFingerprinting: true,
          autoRotation: true,
          cookieDomain: config.cookieDomain
        })
      : getEncryptedTokenManager({
          useCookies: true,
          cookieDomain: config.cookieDomain,
          encryptionPassword: process.env.TOKEN_ENCRYPTION_KEY
        })
    
    const sessionManager = getSessionManager({
      sessionTimeout: config.sessionTimeout,
      activityTimeout: config.activityTimeout
    })
    
    const crossAppSync = config.enableSecureCrossAppSync
      ? createSecureCrossAppSync({
          appId: config.appId,
          hmacSecret: config.hmacSecret,
          enableEncryption: true
        })
      : config.enableCrossAppSync
      ? createCrossAppSync(config.appId)
      : null
    
    return { authService, tokenManager, sessionManager, crossAppSync }
  })
  
  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        
        // Check existing session
        const existingSession = services.sessionManager.getCurrentSession()
        if (existingSession) {
          setSession(existingSession)
          setUser(existingSession.user)
        }
        
        // Set up cross-app sync
        if (services.crossAppSync) {
          const unsubscribe = services.crossAppSync.subscribeToAuthEvents((event: AuthEvent) => {
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
            onAuthStateChange?.(event)
          })
          
          // Request session from other apps
          services.crossAppSync.requestSessionFromApps()
          
          return () => {
            unsubscribe()
          }
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }
    
    init()
  }, [])
  
  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const authSession = await services.authService.signIn({ email, password })
      
      // Create secure session if using secure tokens
      let finalSession = authSession
      if (config.useSecureTokens && authSession && 'createSession' in services.tokenManager) {
        finalSession = await services.tokenManager.createSession(authSession.user, {
          loginMethod: 'email'
        })
      }
      
      // Save session
      if (finalSession) {
        await services.sessionManager.saveSession(finalSession)
      }
      
      // Update state
      if (finalSession) {
        setSession(finalSession)
        setUser(finalSession.user)
      }
      
      // Broadcast
      if (finalSession) {
        services.crossAppSync?.broadcastAuthEvent({
          type: 'SIGN_IN',
          payload: finalSession
        })
        
        onAuthStateChange?.({ type: 'SIGN_IN', payload: finalSession })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [config.useSecureTokens, onAuthStateChange])
  
  // Sign up
  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const authSession = await services.authService.signUp({ 
        email, 
        password,
        metadata 
      })
      
      // Create secure session if using secure tokens
      let finalSession = authSession
      if (config.useSecureTokens && authSession && 'createSession' in services.tokenManager) {
        finalSession = await services.tokenManager.createSession(authSession.user, {
          loginMethod: 'email',
          isNewUser: true
        })
      }
      
      // Save session
      if (finalSession) {
        await services.sessionManager.saveSession(finalSession)
      }
      
      // Update state
      if (finalSession) {
        setSession(finalSession)
        setUser(finalSession.user)
      }
      
      // Broadcast
      if (finalSession) {
        services.crossAppSync?.broadcastAuthEvent({
          type: 'SIGN_IN',
          payload: finalSession
        })
        
        onAuthStateChange?.({ type: 'SIGN_IN', payload: finalSession })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [config.useSecureTokens, onAuthStateChange])
  
  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      
      await services.authService.signOut()
      await services.sessionManager.clearSession()
      
      if ('logout' in services.tokenManager) {
        await services.tokenManager.logout()
      }
      
      clearAuth()
      
      services.crossAppSync?.broadcastAuthEvent({
        type: 'SIGN_OUT',
        payload: null
      })
      
      onAuthStateChange?.({ type: 'SIGN_OUT', payload: null })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [onAuthStateChange])
  
  // Reset password
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
  
  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true)
      setError(null)
      await services.authService.updatePassword(newPassword)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password update failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Get access token
  const getAccessToken = useCallback(async () => {
    if ('getAccessToken' in services.tokenManager) {
      return services.tokenManager.getAccessToken()
    }
    return session?.access_token || null
  }, [session])
  
  // Get auth headers
  const getAuthHeaders = useCallback(async () => {
    if ('getAuthHeaders' in services.tokenManager) {
      return services.tokenManager.getAuthHeaders()
    }
    
    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    return headers
  }, [session])
  
  // Get CSRF token
  const getCsrfToken = useCallback(() => {
    if ('getCsrfToken' in services.tokenManager) {
      return services.tokenManager.getCsrfToken()
    }
    return null
  }, [])
  
  const contextValue: UnifiedAuthContextValue = {
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
    getAccessToken,
    getAuthHeaders,
    getCsrfToken
  }
  
  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

// Hooks
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }
  return context
}

export function useUser() {
  const { user } = useUnifiedAuth()
  return user
}

export function useSession() {
  const { session } = useUnifiedAuth()
  return session
}

// Protected route component
export interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, fallback, redirectTo }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useUnifiedAuth()
  
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