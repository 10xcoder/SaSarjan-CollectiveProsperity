import { parse, serialize } from 'cookie'
import { randomBytes } from 'crypto'

export interface CookieOptions {
  domain?: string
  path?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export interface SecureCookieStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string, options?: CookieOptions): void
  removeItem(key: string): void
  clear(): void
  getCsrfToken(): string
  validateCsrfToken(token: string): boolean
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7 // 7 days
}

// CSRF token management
const CSRF_TOKEN_KEY = 'sasarjan-csrf-token'
let csrfToken: string | null = null

function generateCsrfToken(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return randomBytes(32).toString('hex')
  } else {
    // Client-side - use Web Crypto API
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

export function createSecureCookieStorage(
  prefix = 'sasarjan-auth',
  defaultOptions: CookieOptions = {}
): SecureCookieStorage {
  const isClient = typeof window !== 'undefined'
  const options = { ...DEFAULT_COOKIE_OPTIONS, ...defaultOptions }

  // Helper function to get cookie value
  function getCookie(name: string): string | null {
    if (isClient) {
      const cookies = parse(document.cookie)
      return cookies[name] || null
    }
    return null
  }

  // Helper function to set cookie
  function setCookie(name: string, value: string, cookieOptions: CookieOptions = {}) {
    if (isClient) {
      const finalOptions = { ...options, ...cookieOptions }
      document.cookie = serialize(name, value, finalOptions)
    }
  }

  // Helper function to delete cookie
  function deleteCookie(name: string) {
    if (isClient) {
      document.cookie = serialize(name, '', {
        ...options,
        maxAge: -1
      })
    }
  }

  return {
    getItem(key: string): string | null {
      if (!isClient) return null
      
      try {
        const cookieName = `${prefix}-${key}`
        return getCookie(cookieName)
      } catch (error) {
        console.warn('Error reading from cookie storage:', error)
        return null
      }
    },

    setItem(key: string, value: string, cookieOptions?: CookieOptions): void {
      if (!isClient) return
      
      try {
        const cookieName = `${prefix}-${key}`
        setCookie(cookieName, value, cookieOptions)
      } catch (error) {
        console.warn('Error writing to cookie storage:', error)
      }
    },

    removeItem(key: string): void {
      if (!isClient) return
      
      try {
        const cookieName = `${prefix}-${key}`
        deleteCookie(cookieName)
      } catch (error) {
        console.warn('Error removing from cookie storage:', error)
      }
    },

    clear(): void {
      if (!isClient) return
      
      try {
        const cookies = parse(document.cookie)
        Object.keys(cookies).forEach(key => {
          if (key.startsWith(`${prefix}-`)) {
            deleteCookie(key)
          }
        })
      } catch (error) {
        console.warn('Error clearing cookie storage:', error)
      }
    },

    getCsrfToken(): string {
      if (!csrfToken) {
        // Try to get existing token from cookie
        csrfToken = getCookie(CSRF_TOKEN_KEY)
        
        // Generate new token if not found
        if (!csrfToken) {
          csrfToken = generateCsrfToken()
          // Store CSRF token in a non-httpOnly cookie so JS can read it
          setCookie(CSRF_TOKEN_KEY, csrfToken, {
            httpOnly: false, // Allow JS access for double-submit pattern
            sameSite: 'strict'
          })
        }
      }
      return csrfToken
    },

    validateCsrfToken(token: string): boolean {
      const storedToken = getCookie(CSRF_TOKEN_KEY)
      return storedToken === token && token.length > 0
    }
  }
}

// Migration helper to move tokens from localStorage to cookies
export async function migrateFromLocalStorage(
  cookieStorage: SecureCookieStorage,
  localStoragePrefix = 'sasarjan-auth'
): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage)
    const authKeys = keys.filter(key => key.startsWith(`${localStoragePrefix}-`))
    
    for (const key of authKeys) {
      const value = localStorage.getItem(key)
      if (value) {
        // Extract the key name without prefix
        const keyName = key.replace(`${localStoragePrefix}-`, '')
        
        // Skip migration for certain keys that shouldn't be in cookies
        const skipKeys = ['device-fingerprint', 'session-metadata']
        if (skipKeys.includes(keyName)) continue
        
        // Migrate to cookie storage
        cookieStorage.setItem(keyName, value)
        
        // Remove from localStorage
        localStorage.removeItem(key)
      }
    }
    
    console.info('Successfully migrated auth tokens from localStorage to cookies')
  } catch (error) {
    console.error('Error during token migration:', error)
  }
}