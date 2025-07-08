'use client'

import { useState, useCallback } from 'react'
import { useAuth, useAuthActions } from '../client/auth-store'
import { AuthService } from '../core/auth-service'

interface AuthenticationOptions {
  supabaseUrl: string
  supabaseAnonKey: string
}

interface SignUpData {
  method: 'email' | 'phone'
  identifier: string
  fullName: string
  password?: string
  agreedToTerms: boolean
}

interface SignInData {
  method: 'email' | 'phone'
  identifier: string
  password?: string
  isPasswordless?: boolean
}

interface VerificationData {
  method: 'email' | 'phone'
  identifier: string
  code: string
  type: 'signup' | 'signin'
  userData?: {
    fullName?: string
    password?: string
  }
}

export function useAuthentication(options: AuthenticationOptions) {
  const auth = useAuth()
  const authActions = useAuthActions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authService = new AuthService({
    supabaseUrl: options.supabaseUrl,
    supabaseAnonKey: options.supabaseAnonKey
  })

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendVerificationCode = useCallback(async (
    method: 'email' | 'phone',
    identifier: string,
    type: 'signup' | 'signin',
    fullName?: string
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method,
          identifier,
          type,
          fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyCode = useCallback(async (data: VerificationData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed')
      }

      // If signup was successful, update auth state
      if (result.session) {
        authActions.setSession(result.session)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authActions])

  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!data.agreedToTerms) {
        throw new Error('You must agree to the terms and conditions')
      }

      // Send verification code
      await sendVerificationCode(data.method, data.identifier, 'signup', data.fullName)
      
      return {
        success: true,
        message: `Verification code sent to your ${data.method}`,
        nextStep: 'verify'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [sendVerificationCode])

  const signIn = useCallback(async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (data.isPasswordless) {
        // Send verification code for passwordless login
        await sendVerificationCode(data.method, data.identifier, 'signin')
        
        return {
          success: true,
          message: `Verification code sent to your ${data.method}`,
          nextStep: 'verify'
        }
      } else {
        // Traditional password login
        if (data.method !== 'email') {
          throw new Error('Password login is only available for email accounts')
        }

        if (!data.password) {
          throw new Error('Password is required')
        }

        const session = await authService.signIn({
          email: data.identifier,
          password: data.password
        })

        authActions.setSession(session)

        return {
          success: true,
          message: 'Signed in successfully',
          session
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authService, authActions, sendVerificationCode])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signOut()
      authActions.clearAuth()

      return {
        success: true,
        message: 'Signed out successfully'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authService, authActions])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/auth/callback`
      })

      // OAuth redirects, so we don't need to handle the response here
      return {
        success: true,
        message: `Redirecting to ${provider}...`
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} sign in failed`
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword({ email })

      return {
        success: true,
        message: 'Password reset link sent to your email'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  return {
    // Auth state
    user: auth.user,
    session: auth.session,
    isAuthenticated: auth.isAuthenticated,
    isLoading: isLoading || auth.isLoading,
    error: error || auth.error,

    // Actions
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPassword,
    sendVerificationCode,
    verifyCode,
    clearError,

    // Utilities
    isSessionValid: authService.isSessionValid.bind(authService),
    refreshSession: authService.forceRefreshSession.bind(authService)
  }
}