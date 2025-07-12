import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@sasarjan/auth'
import { getSecureTokenService } from '@sasarjan/auth'
import { createCookieHandler, withCsrfProtection } from '@sasarjan/auth'

export const POST = withCsrfProtection(async (req: any, _res: any) => {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Initialize auth service
    const authService = new AuthService({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    })
    
    // Sign in user
    const { user, session: _session } = await authService.signIn({ email, password })
    
    // Create secure token service
    const tokenService = getSecureTokenService({
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY
    })
    
    // Create secure session with device fingerprinting
    const deviceFingerprint = req.headers.get('x-device-fingerprint')
    const secureSession = await tokenService.createSession(
      user,
      deviceFingerprint ? JSON.parse(deviceFingerprint) : undefined,
      { loginMethod: 'email' }
    )
    
    // Create response with cookies
    const response = NextResponse.json({
      user,
      session: {
        id: secureSession.id,
        expires_at: secureSession.expires_at
      }
    })
    
    // Get cookie handler
    const cookies = createCookieHandler(req as any, response as any)
    
    // Set secure cookies
    cookies.set('sasarjan-auth-access', secureSession.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: secureSession.expires_in
    })
    
    cookies.set('sasarjan-auth-refresh', secureSession.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    )
  }
})