import { IncomingMessage, ServerResponse } from 'http'
import { createCookieHandler, CookieHandler } from './cookie-handler'

export interface CsrfOptions {
  excludePaths?: string[]
  tokenName?: string
  headerName?: string
  cookieOptions?: {
    domain?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
}

const DEFAULT_CSRF_OPTIONS: CsrfOptions = {
  excludePaths: ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'],
  tokenName: 'sasarjan-csrf-token',
  headerName: 'x-csrf-token'
}

// CSRF protection middleware for Express/Connect
export function csrfProtection(options: CsrfOptions = {}) {
  const config = { ...DEFAULT_CSRF_OPTIONS, ...options }
  
  return (req: any, res: any, next: () => void) => {
    // Initialize cookie handler if not already present
    if (!req.cookies || typeof req.cookies.getCsrfToken !== 'function') {
      req.cookies = createCookieHandler(req, res, config.cookieOptions)
    }
    
    // Skip CSRF check for excluded paths
    const path = req.path || req.url
    if (config.excludePaths?.some(excluded => path.startsWith(excluded))) {
      return next()
    }
    
    // Skip CSRF check for safe methods
    const method = req.method.toUpperCase()
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next()
    }
    
    // Get CSRF token from request
    const headerToken = req.headers[config.headerName!] as string
    const bodyToken = req.body?._csrf as string
    const queryToken = req.query?._csrf as string
    
    const requestToken = headerToken || bodyToken || queryToken
    
    // Validate CSRF token
    if (!requestToken || !req.cookies.validateCsrfToken(requestToken)) {
      res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
      return
    }
    
    next()
  }
}

// CSRF protection for Next.js API routes
export function withCsrfProtection(
  handler: (req: any, res: any) => Promise<void>,
  options: CsrfOptions = {}
) {
  const config = { ...DEFAULT_CSRF_OPTIONS, ...options }
  
  return async (req: any, res: any) => {
    // Initialize cookie handler
    if (!req.cookies || typeof req.cookies.getCsrfToken !== 'function') {
      req.cookies = createCookieHandler(req, res, config.cookieOptions)
    }
    
    // Skip CSRF check for excluded paths
    const path = req.url
    if (config.excludePaths?.some(excluded => path.startsWith(excluded))) {
      return handler(req, res)
    }
    
    // Skip CSRF check for safe methods
    const method = req.method?.toUpperCase() || 'GET'
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return handler(req, res)
    }
    
    // Get CSRF token from request
    const headerToken = req.headers[config.headerName!] as string
    const bodyToken = req.body?._csrf as string
    const queryToken = req.query?._csrf as string
    
    const requestToken = headerToken || bodyToken || queryToken
    
    // Validate CSRF token
    if (!requestToken || !req.cookies.validateCsrfToken(requestToken)) {
      res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed. Please refresh the page and try again.'
      })
      return
    }
    
    return handler(req, res)
  }
}

// Helper to get CSRF token for forms
export function getCsrfToken(req: any): string {
  if (!req.cookies || typeof req.cookies.getCsrfToken !== 'function') {
    throw new Error('Cookie handler not initialized')
  }
  
  return req.cookies.getCsrfToken()
}

// React hook for CSRF token (client-side)
export function useCsrfToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Get CSRF token from cookie
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  
  return cookies['sasarjan-csrf-token'] || null
}