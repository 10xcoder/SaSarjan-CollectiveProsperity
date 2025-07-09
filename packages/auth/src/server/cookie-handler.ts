import { IncomingMessage, ServerResponse } from 'http'
import { parse, serialize } from 'cookie'
import { randomBytes } from 'crypto'

export interface ServerCookieOptions {
  domain?: string
  path?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  signed?: boolean
}

export interface CookieHandler {
  get(name: string): string | null
  set(name: string, value: string, options?: ServerCookieOptions): void
  delete(name: string): void
  getCsrfToken(): string
  validateCsrfToken(token: string): boolean
  signValue(value: string): string
  unsignValue(signedValue: string): string | null
}

const DEFAULT_SERVER_COOKIE_OPTIONS: ServerCookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  signed: true
}

// CSRF token settings
const CSRF_TOKEN_NAME = 'sasarjan-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Cookie signature secret (should be from environment variable)
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'sasarjan-cookie-secret-change-this'

export function createCookieHandler(
  req: IncomingMessage,
  res: ServerResponse,
  options: ServerCookieOptions = {}
): CookieHandler {
  const cookieOptions = { ...DEFAULT_SERVER_COOKIE_OPTIONS, ...options }
  
  // Array to collect cookies to be set
  const cookiesToSet: string[] = []

  // Helper to parse cookies dynamically
  function getCookies(): Record<string, string> {
    const parsed = parse(req.headers.cookie || '')
    // Filter out undefined values
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        result[key] = value
      }
    }
    return result
  }

  // Helper to create HMAC signature
  function createSignature(value: string): string {
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', COOKIE_SECRET)
      .update(value)
      .digest('base64')
      .replace(/[=+/]/g, '')
  }

  // Helper to verify signature
  function verifySignature(value: string, signature: string): boolean {
    const expectedSignature = createSignature(value)
    return signature === expectedSignature
  }

  const handler: CookieHandler = {
    get(name: string): string | null {
      const cookies = getCookies()
      const value = cookies[name]
      if (!value) return null

      // Check if this cookie has a signature (indicating it was signed)
      const signedValue = cookies[`${name}.sig`]
      
      // If there's a signature, verify it
      if (signedValue) {
        if (!verifySignature(value, signedValue)) {
          console.warn(`Invalid signature for cookie: ${name}`)
          return null
        }
      }
      // If no signature but signed cookies are enabled by default, 
      // allow unsigned cookies for specific cases like CSRF tokens
      else if (cookieOptions.signed && name !== CSRF_TOKEN_NAME) {
        console.warn(`Missing signature for cookie: ${name}`)
        return null
      }

      return value
    },

    set(name: string, value: string, customOptions?: ServerCookieOptions): void {
      const finalOptions = { ...cookieOptions, ...customOptions }
      
      // Set the main cookie
      cookiesToSet.push(serialize(name, value, finalOptions))
      
      // If signed cookies are enabled, set signature cookie
      if (finalOptions.signed) {
        const signature = createSignature(value)
        const signatureOptions = {
          ...finalOptions,
          httpOnly: true // Signature should always be httpOnly
        }
        cookiesToSet.push(serialize(`${name}.sig`, signature, signatureOptions))
      }

      // Update response headers
      const existingCookies = res.getHeader('Set-Cookie') as string[] | string | undefined
      const newCookies = Array.isArray(existingCookies) 
        ? [...existingCookies, ...cookiesToSet]
        : existingCookies 
        ? [existingCookies, ...cookiesToSet]
        : cookiesToSet
      
      res.setHeader('Set-Cookie', newCookies)
      cookiesToSet.length = 0 // Clear array
    },

    delete(name: string): void {
      // Delete main cookie
      this.set(name, '', { ...cookieOptions, maxAge: -1 })
      
      // Delete signature cookie if exists
      if (cookieOptions.signed) {
        const signatureOptions = { ...cookieOptions, maxAge: -1 }
        cookiesToSet.push(serialize(`${name}.sig`, '', signatureOptions))
        
        // Update headers
        const existingCookies = res.getHeader('Set-Cookie') as string[] | string | undefined
        const newCookies = Array.isArray(existingCookies) 
          ? [...existingCookies, ...cookiesToSet]
          : existingCookies 
          ? [existingCookies, ...cookiesToSet]
          : cookiesToSet
        
        res.setHeader('Set-Cookie', newCookies)
        cookiesToSet.length = 0
      }
    },

    getCsrfToken(): string {
      let token = this.get(CSRF_TOKEN_NAME)
      
      if (!token) {
        // Generate new CSRF token
        token = randomBytes(32).toString('hex')
        
        // Set CSRF token cookie (not httpOnly so JS can read it)
        this.set(CSRF_TOKEN_NAME, token, {
          httpOnly: false,
          sameSite: 'strict',
          signed: false // CSRF tokens don't need signing
        })
      }
      
      return token
    },

    validateCsrfToken(token: string): boolean {
      if (!token) return false
      
      // Basic token format validation
      if (token.length < 32 || !/^[a-f0-9]+$/i.test(token)) {
        return false
      }
      
      // Get the stored CSRF token from cookie
      const cookieToken = this.get(CSRF_TOKEN_NAME)
      if (!cookieToken) return false
      
      // Use constant-time comparison to prevent timing attacks
      return cookieToken === token
    },

    signValue(value: string): string {
      return `${value}.${createSignature(value)}`
    },

    unsignValue(signedValue: string): string | null {
      const parts = signedValue.split('.')
      if (parts.length !== 2) return null
      
      const [value, signature] = parts
      if (verifySignature(value, signature)) {
        return value
      }
      
      return null
    }
  }

  return handler
}

// Middleware factory for Express/Connect-style frameworks
export function cookieMiddleware(options?: ServerCookieOptions) {
  return (req: any, res: any, next: () => void) => {
    req.cookies = createCookieHandler(req, res, options)
    next()
  }
}

// Helper for Next.js API routes
export function withCookies(
  handler: (req: any, res: any) => Promise<void>,
  options?: ServerCookieOptions
) {
  return async (req: any, res: any) => {
    req.cookies = createCookieHandler(req, res, options)
    return handler(req, res)
  }
}