import { IncomingMessage, ServerResponse } from 'http'
import { verifyToken, extractBearerToken, validateTokenClaims, type TokenPayload, type JWTConfig } from '../utils/jwt'
import { createCookieHandler, type CookieHandler } from './cookie-handler'

export interface JWTMiddlewareOptions extends JWTConfig {
  excludePaths?: string[]
  requireAuth?: boolean
  onUnauthorized?: (req: any, res: any) => void
  cookieTokenName?: string
  headerTokenName?: string
}

const DEFAULT_OPTIONS: JWTMiddlewareOptions = {
  excludePaths: ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/health'],
  requireAuth: true,
  cookieTokenName: 'sasarjan-auth-access',
  headerTokenName: 'authorization'
}

// Extend request interface
declare module 'http' {
  interface IncomingMessage {
    user?: TokenPayload
    cookies?: CookieHandler
  }
}

// JWT validation middleware for Express/Connect
export function jwtProtection(options: JWTMiddlewareOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  return async (req: any, res: any, next: () => void) => {
    // Initialize cookie handler if not present
    if (!req.cookies || typeof req.cookies.get !== 'function') {
      req.cookies = createCookieHandler(req, res)
    }
    
    // Skip auth for excluded paths
    const path = req.path || req.url
    if (config.excludePaths?.some(excluded => path.startsWith(excluded))) {
      return next()
    }
    
    try {
      // Try to get token from Authorization header first
      let token = extractBearerToken(req.headers[config.headerTokenName!])
      
      // Fallback to cookie if no header token
      if (!token && config.cookieTokenName) {
        token = req.cookies.get(config.cookieTokenName)
      }
      
      if (!token) {
        if (config.requireAuth) {
          return handleUnauthorized(req, res, config, 'No authentication token provided')
        }
        return next()
      }
      
      // Verify token
      const payload = await verifyToken(token, config)
      
      // Validate claims
      validateTokenClaims(payload)
      
      // Attach user to request
      req.user = payload
      
      // Check if token is about to expire and set header
      const exp = payload.exp || 0
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = exp - now
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        res.setHeader('X-Token-Expires-Soon', 'true')
        res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString())
      }
      
      next()
    } catch (error) {
      if (config.requireAuth) {
        const message = error instanceof Error ? error.message : 'Invalid token'
        return handleUnauthorized(req, res, config, message)
      }
      
      // If auth not required, continue without user
      next()
    }
  }
}

// JWT protection for Next.js API routes
export function withJWTAuth(
  handler: (req: any, res: any) => Promise<void>,
  options: JWTMiddlewareOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  return async (req: any, res: any) => {
    // Initialize cookie handler
    if (!req.cookies || typeof req.cookies.get !== 'function') {
      req.cookies = createCookieHandler(req, res)
    }
    
    // Skip auth for excluded paths
    const path = req.url
    if (config.excludePaths?.some(excluded => path.startsWith(excluded))) {
      return handler(req, res)
    }
    
    try {
      // Try to get token from Authorization header first
      let token = extractBearerToken(req.headers[config.headerTokenName!])
      
      // Fallback to cookie if no header token
      if (!token && config.cookieTokenName) {
        token = req.cookies.get(config.cookieTokenName)
      }
      
      if (!token) {
        if (config.requireAuth) {
          return handleUnauthorized(req, res, config, 'No authentication token provided')
        }
        return handler(req, res)
      }
      
      // Verify token
      const payload = await verifyToken(token, config)
      
      // Validate claims
      validateTokenClaims(payload)
      
      // Attach user to request
      req.user = payload
      
      // Check if token is about to expire
      const exp = payload.exp || 0
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = exp - now
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        res.setHeader('X-Token-Expires-Soon', 'true')
        res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString())
      }
      
      return handler(req, res)
    } catch (error) {
      if (config.requireAuth) {
        const message = error instanceof Error ? error.message : 'Invalid token'
        return handleUnauthorized(req, res, config, message)
      }
      
      // If auth not required, continue without user
      return handler(req, res)
    }
  }
}

// Helper to get user from request
export function getRequestUser(req: any): TokenPayload | null {
  return req.user || null
}

// Helper to require specific roles
export function requireRoles(roles: string[]) {
  return (req: any, res: any, next?: () => void) => {
    const user = getRequestUser(req)
    
    if (!user) {
      return handleUnauthorized(req, res, {}, 'Authentication required')
    }
    
    const userRoles = user.roles || []
    const hasRequiredRole = roles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      return handleForbidden(req, res, 'Insufficient permissions')
    }
    
    if (next) {
      next()
    }
  }
}

// Helper to require specific permissions
export function requirePermissions(permissions: string[]) {
  return (req: any, res: any, next?: () => void) => {
    const user = getRequestUser(req)
    
    if (!user) {
      return handleUnauthorized(req, res, {}, 'Authentication required')
    }
    
    const userPermissions = user.permissions || []
    const hasRequiredPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    )
    
    if (!hasRequiredPermission) {
      return handleForbidden(req, res, 'Insufficient permissions')
    }
    
    if (next) {
      next()
    }
  }
}

// Error handlers
function handleUnauthorized(
  req: any, 
  res: any, 
  config: JWTMiddlewareOptions,
  message: string
) {
  if (config.onUnauthorized) {
    return config.onUnauthorized(req, res)
  }
  
  res.status(401).json({
    error: 'Unauthorized',
    message,
    timestamp: new Date().toISOString()
  })
}

function handleForbidden(req: any, res: any, message: string) {
  res.status(403).json({
    error: 'Forbidden',
    message,
    timestamp: new Date().toISOString()
  })
}