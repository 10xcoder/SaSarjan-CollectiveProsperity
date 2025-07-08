import type { AuthConfig } from '../types'

export function createAuthConfig(config: Partial<AuthConfig> & { 
  supabaseUrl: string; 
  supabaseAnonKey: string 
}): AuthConfig {
  return {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    redirectUrl: config.redirectUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
    storageKey: config.storageKey || 'sasarjan-auth',
    autoRefreshToken: config.autoRefreshToken ?? true,
    persistSession: config.persistSession ?? true,
    detectSessionInUrl: config.detectSessionInUrl ?? true
  }
}

export function validateAuthConfig(config: AuthConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.supabaseUrl) {
    errors.push('supabaseUrl is required')
  }

  if (!config.supabaseAnonKey) {
    errors.push('supabaseAnonKey is required')
  }

  try {
    new URL(config.supabaseUrl)
  } catch {
    errors.push('supabaseUrl must be a valid URL')
  }

  if (config.redirectUrl) {
    try {
      new URL(config.redirectUrl)
    } catch {
      errors.push('redirectUrl must be a valid URL')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}