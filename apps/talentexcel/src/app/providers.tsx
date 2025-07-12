'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
  appId: string
}

export function Providers({ children, appId }: ProvidersProps) {
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark', 'talent-blue']}
    >
      {children}
    </ThemeProvider>
  )
}