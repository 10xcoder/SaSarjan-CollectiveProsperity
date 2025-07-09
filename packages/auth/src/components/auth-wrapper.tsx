'use client'

import React from 'react'
import { SecureAuthProvider, type SecureAuthConfig } from './secure-auth-provider'

export interface AuthWrapperProps {
  children: React.ReactNode
  appId: string
  appName: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  cookieDomain?: string
  enableCrossAppSync?: boolean
}

/**
 * Simplified auth wrapper that uses environment variables
 * Perfect for quick integration into existing apps
 */
export function AuthWrapper({
  children,
  appId,
  appName,
  supabaseUrl,
  supabaseAnonKey,
  cookieDomain,
  enableCrossAppSync = true
}: AuthWrapperProps) {
  // Get config from environment or props
  const config: SecureAuthConfig = {
    appId,
    appName,
    appUrl: typeof window !== 'undefined' ? window.location.origin : '',
    supabaseUrl: supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    enableFingerprinting: true,
    enableTokenRotation: true,
    enableCrossAppSync,
    cookieDomain: cookieDomain || process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    activityTimeout: 30 * 60 * 1000, // 30 minutes
    jwtConfig: {
      algorithm: 'RS256',
      issuer: 'sasarjan-auth',
      audience: 'sasarjan-apps'
    }
  }
  
  // Validate required config
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }
  
  return (
    <SecureAuthProvider config={config}>
      {children}
    </SecureAuthProvider>
  )
}

// Re-export hooks for convenience
export { 
  useSecureAuth as useAuth,
  useUser,
  useSession,
  useAuthHeaders,
  useCsrfToken,
  ProtectedRoute 
} from './secure-auth-provider'