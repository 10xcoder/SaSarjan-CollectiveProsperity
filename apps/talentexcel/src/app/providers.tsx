'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import { UnifiedAuthProvider } from '@sasarjan/auth/client-only'
import type { UnifiedAuthConfig } from '@sasarjan/auth/client-only'

interface ProvidersProps {
  children: React.ReactNode
  appId: string
}

export function Providers({ children, appId }: ProvidersProps) {
  const authConfig: UnifiedAuthConfig = {
    appId: 'talentexcel',
    appName: 'TalentExcel',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    
    // Security features
    useSecureTokens: true,
    enableSecureCrossAppSync: true, // Using secure sync with HMAC
    hmacSecret: process.env.HMAC_SECRET_KEY,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    
    // Session configuration
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    activityTimeout: 30 * 60 * 1000, // 30 minutes
    
    // Supabase configuration
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
  
  useEffect(() => {
    // Skip initialization during build/SSR
    if (typeof window === 'undefined') return
    
    try {
      console.log('TalentExcel app initialized:', appId)
    } catch (error) {
      console.error('App initialization failed:', error)
    }
  }, [appId])
  
  return (
    <UnifiedAuthProvider config={authConfig}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={['light', 'dark', 'talent-blue']}
      >
        {children as any}
      </ThemeProvider>
    </UnifiedAuthProvider>
  )
}