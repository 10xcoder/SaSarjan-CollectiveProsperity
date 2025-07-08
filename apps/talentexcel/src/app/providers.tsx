'use client'

import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider } from '@sasarjan/auth/client-only'
import { createCrossAppSync } from '@sasarjan/auth'
import { useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
  appId: string
}

export function Providers({ children, appId }: ProvidersProps) {
  useEffect(() => {
    // Initialize cross-app SSO sync
    const crossAppSync = createCrossAppSync(
      process.env.NODE_ENV === 'development' ? 'talentexcel-dev' : 'talentexcel'
    )
    
    // Register trusted apps
    crossAppSync.registerApp({
      appId: 'sasarjan-main',
      origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://sasarjan.com',
      permissions: ['read_session', 'write_session']
    })
    
    crossAppSync.registerApp({
      appId: 'sevapremi',
      origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3002' 
        : 'https://sevapremi.com',
      permissions: ['read_session', 'write_session']
    })
    
    crossAppSync.registerApp({
      appId: '10xgrowth',
      origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3003' 
        : 'https://10xgrowth.com',
      permissions: ['read_session', 'write_session']
    })
    
    // Check for existing session from other apps
    crossAppSync.requestSessionFromApps()
    
    return () => {
      crossAppSync.destroy()
    }
  }, [])
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark', 'talent-blue']}
    >
      <NextIntlClientProvider>
        <AuthProvider
          config={{
            appName: 'TalentExcel',
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://talentexcel.com',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          }}
        >
          {children}
        </AuthProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}