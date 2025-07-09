'use client'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { UnifiedAuthProvider } from '@sasarjan/auth/client-only'
import type { UnifiedAuthConfig } from '@sasarjan/auth/client-only'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  const authConfig: UnifiedAuthConfig = {
    appId: 'sasarjan-admin',
    appName: 'SaSarjan Admin',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004',
    
    // Security features
    useSecureTokens: true,
    enableSecureCrossAppSync: true, // Using secure sync with HMAC
    hmacSecret: process.env.HMAC_SECRET_KEY,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    
    // Session configuration
    sessionTimeout: 12 * 60 * 60 * 1000, // 12 hours for admin
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
      >
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </UnifiedAuthProvider>
  )
}