import { SignJWT, jwtVerify, generateKeyPair, exportSPKI, exportPKCS8, importSPKI, importPKCS8, type JWTPayload } from 'jose'
import { nanoid } from 'nanoid'

export interface JWTConfig {
  algorithm?: 'RS256' | 'ES256'
  issuer?: string
  audience?: string
  expiresIn?: string
  privateKey?: string
  publicKey?: string
}

export interface TokenPayload extends JWTPayload {
  sub: string // User ID
  email?: string
  fingerprint?: string
  sessionId?: string
  roles?: string[]
  permissions?: string[]
  metadata?: Record<string, any>
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

const DEFAULT_CONFIG: Required<JWTConfig> = {
  algorithm: 'RS256',
  issuer: 'sasarjan-auth',
  audience: 'sasarjan-apps',
  expiresIn: '1h',
  privateKey: '',
  publicKey: ''
}

// Key management
let cachedPrivateKey: any = null
let cachedPublicKey: any = null

export async function generateJWTKeyPair(algorithm: 'RS256' | 'ES256' = 'RS256'): Promise<{ privateKey: string; publicKey: string }> {
  const alg = algorithm === 'RS256' ? 'RS256' : 'ES256'
  const { publicKey, privateKey } = await generateKeyPair(alg)
  
  const publicKeyString = await exportSPKI(publicKey)
  const privateKeyString = await exportPKCS8(privateKey)
  
  return {
    privateKey: privateKeyString,
    publicKey: publicKeyString
  }
}

async function getPrivateKey(config: JWTConfig): Promise<any> {
  if (cachedPrivateKey) return cachedPrivateKey
  
  const privateKeyString = config.privateKey || process.env.JWT_PRIVATE_KEY
  if (!privateKeyString) {
    throw new Error('JWT private key not configured. Set JWT_PRIVATE_KEY environment variable.')
  }
  
  cachedPrivateKey = await importPKCS8(privateKeyString, config.algorithm || 'RS256')
  return cachedPrivateKey
}

async function getPublicKey(config: JWTConfig): Promise<any> {
  if (cachedPublicKey) return cachedPublicKey
  
  const publicKeyString = config.publicKey || process.env.JWT_PUBLIC_KEY
  if (!publicKeyString) {
    throw new Error('JWT public key not configured. Set JWT_PUBLIC_KEY environment variable.')
  }
  
  cachedPublicKey = await importSPKI(publicKeyString, config.algorithm || 'RS256')
  return cachedPublicKey
}

export async function signToken(
  payload: TokenPayload,
  config: JWTConfig = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const privateKey = await getPrivateKey(finalConfig)
  
  // Add standard claims
  const now = Math.floor(Date.now() / 1000)
  const jti = nanoid() // Unique token ID for tracking/revocation
  
  const jwt = await new SignJWT({
    ...payload,
    jti,
    iat: now,
    nbf: now // Not before
  })
    .setProtectedHeader({ alg: finalConfig.algorithm })
    .setIssuer(finalConfig.issuer)
    .setAudience(finalConfig.audience)
    .setExpirationTime(finalConfig.expiresIn)
    .sign(privateKey)
  
  return jwt
}

export async function verifyToken(
  token: string,
  config: JWTConfig = {}
): Promise<TokenPayload> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const publicKey = await getPublicKey(finalConfig)
  
  try {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: finalConfig.issuer,
      audience: finalConfig.audience,
      algorithms: [finalConfig.algorithm]
    })
    
    return payload as TokenPayload
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT verification failed: ${error.message}`)
    }
    throw error
  }
}

export async function generateTokenPair(
  userId: string,
  payload: Partial<TokenPayload> = {},
  config: JWTConfig = {}
): Promise<TokenPair> {
  const sessionId = nanoid()
  
  // Access token - short lived (1 hour default)
  const accessTokenPayload: TokenPayload = {
    sub: userId,
    sessionId,
    type: 'access',
    ...payload
  }
  
  const accessToken = await signToken(accessTokenPayload, {
    ...config,
    expiresIn: config.expiresIn || '1h'
  })
  
  // Refresh token - long lived (7 days)
  const refreshTokenPayload: TokenPayload = {
    sub: userId,
    sessionId,
    type: 'refresh',
    fingerprint: payload.fingerprint // Include fingerprint for device binding
  }
  
  const refreshToken = await signToken(refreshTokenPayload, {
    ...config,
    expiresIn: '7d'
  })
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
    tokenType: 'Bearer'
  }
}

export async function rotateTokens(
  refreshToken: string,
  fingerprint: string,
  config: JWTConfig = {}
): Promise<TokenPair> {
  // Verify refresh token
  const payload = await verifyToken(refreshToken, config)
  
  // Validate token type
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type for rotation')
  }
  
  // Validate device fingerprint
  if (payload.fingerprint !== fingerprint) {
    throw new Error('Device fingerprint mismatch - possible token theft')
  }
  
  // Generate new token pair
  return generateTokenPair(payload.sub, {
    email: payload.email,
    fingerprint,
    roles: payload.roles,
    permissions: payload.permissions,
    metadata: payload.metadata
  }, config)
}

// Token blacklist management (for revocation)
const tokenBlacklist = new Set<string>()

export function revokeToken(jti: string): void {
  tokenBlacklist.add(jti)
}

export function isTokenRevoked(jti: string): boolean {
  return tokenBlacklist.has(jti)
}

// Utility to extract token from Authorization header
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  
  return parts[1]
}

// Device fingerprint binding
export interface DeviceFingerprint {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  colorDepth: number
  platform: string
  webglRenderer?: string
  fonts?: string[]
}

export function hashFingerprint(fingerprint: DeviceFingerprint): string {
  // Create a stable string representation
  const fingerprintString = JSON.stringify({
    ua: fingerprint.userAgent,
    sr: fingerprint.screenResolution,
    tz: fingerprint.timezone,
    lang: fingerprint.language,
    cd: fingerprint.colorDepth,
    plt: fingerprint.platform,
    gl: fingerprint.webglRenderer,
    f: fingerprint.fonts?.sort()
  })
  
  // Simple hash for demo - in production use crypto.subtle.digest
  let hash = 0
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

// JWT claims validation
export function validateTokenClaims(payload: TokenPayload): void {
  // Check required claims
  if (!payload.sub) {
    throw new Error('Token missing subject (user ID)')
  }
  
  if (!payload.sessionId) {
    throw new Error('Token missing session ID')
  }
  
  // Check if token is revoked
  if (payload.jti && isTokenRevoked(payload.jti)) {
    throw new Error('Token has been revoked')
  }
  
  // Additional custom validations can be added here
}