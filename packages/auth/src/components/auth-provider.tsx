'use client'

import React, { createContext, useContext } from 'react'

interface AuthConfig {
  appName: string
  appUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
}

interface AuthProviderProps {
  children: React.ReactNode
  config: AuthConfig
}

const AuthContext = createContext<AuthConfig | null>(null)

export function AuthProvider({ children, config }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={config}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthConfig() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthConfig must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider