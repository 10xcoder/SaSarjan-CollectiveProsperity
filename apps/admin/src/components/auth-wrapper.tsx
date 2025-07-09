'use client'

import { UnifiedAuthProvider } from '@sasarjan/auth/client-only'
import type { UnifiedAuthConfig } from '@sasarjan/auth/client-only'

interface AuthWrapperProps {
  children: React.ReactNode
  appId: string
  appName: string
  enableCrossAppSync?: boolean
}

export function AuthWrapper({ 
  children, 
  appId, 
  appName,
  enableCrossAppSync = true 
}: AuthWrapperProps) {
  const config: UnifiedAuthConfig = {
    appId,
    appName,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004',
    useSecureTokens: true,
    enableCrossAppSync,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    activityTimeout: 30 * 60 * 1000, // 30 minutes
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }

  return (
    <UnifiedAuthProvider config={config}>
      {children}
    </UnifiedAuthProvider>
  )
}