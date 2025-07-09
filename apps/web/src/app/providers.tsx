'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { UnifiedAuthProvider } from '@sasarjan/auth/client-only'
import type { UnifiedAuthConfig } from '@sasarjan/auth/client-only'

export function Providers({ children }: { children: ReactNode }) {
  const authConfig: UnifiedAuthConfig = {
    appId: 'sasarjan-web',
    appName: 'SaSarjan Web',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    
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

  return (
    <UnifiedAuthProvider config={authConfig}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="sasarjan-theme"
      >
        {children}
      </ThemeProvider>
    </UnifiedAuthProvider>
  )
}