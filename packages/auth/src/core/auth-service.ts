import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { 
  AuthConfig, 
  AuthSession, 
  User, 
  LoginCredentials, 
  RegistrationData,
  PasswordResetData,
  OAuthConfig,
  AuthError
} from '../types'
import { getSessionManager } from '../client/session-manager'
import { getTokenManager } from '../client/token-manager'

export class AuthService {
  private supabase: SupabaseClient
  private config: AuthConfig
  private sessionManager: ReturnType<typeof getSessionManager>
  private tokenManager: ReturnType<typeof getTokenManager>
  private refreshTimer?: NodeJS.Timeout

  constructor(config: AuthConfig) {
    this.config = config
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: config.persistSession ?? true,
        autoRefreshToken: config.autoRefreshToken ?? true,
        detectSessionInUrl: config.detectSessionInUrl ?? true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': '@sasarjan/auth@1.0.0'
        }
      }
    })
    
    // Initialize session and token managers
    this.sessionManager = getSessionManager({
      sessionTimeout: config.sessionTimeout,
      activityTimeout: config.activityTimeout
    })
    
    this.tokenManager = getTokenManager({
      enableEncryption: config.enableTokenEncryption ?? true,
      tokenRotation: config.enableTokenRotation ?? true
    })
    
    // Set up automatic session refresh
    this.setupSessionRefresh()
  }

  // Get current session
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession()
      if (error) throw this.createAuthError(error)
      
      if (!data.session) return null
      
      return this.transformSession(data.session)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Get current user
  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) throw this.createAuthError(error)
      
      if (!data.user) return null
      
      return this.transformUser(data.user)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw this.createAuthError(error)
      if (!data.session) throw new Error('No session returned')

      const session = this.transformSession(data.session)
      
      // Store session and tokens securely
      await this.sessionManager.saveSession(session)
      this.tokenManager.storeSessionTokens(session)
      
      return session
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Sign up with email and password
  async signUp(registrationData: RegistrationData): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            full_name: registrationData.full_name,
            ...registrationData.metadata
          }
        }
      })

      if (error) throw this.createAuthError(error)
      if (!data.session) return null // Email confirmation required

      const session = this.transformSession(data.session)
      
      // Store session and tokens securely
      await this.sessionManager.saveSession(session)
      this.tokenManager.storeSessionTokens(session)
      
      return session
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Sign in with OAuth provider
  async signInWithOAuth(config: OAuthConfig): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: config.provider as any,
        options: {
          redirectTo: config.redirectTo ?? this.config.redirectUrl,
          scopes: config.scopes,
          queryParams: config.queryParams
        }
      })

      if (error) throw this.createAuthError(error)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw this.createAuthError(error)
      
      // Clear all session and token data
      this.sessionManager.clearSession()
      this.tokenManager.clearAllTokens()
      
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = undefined
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Reset password
  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: this.config.redirectUrl
        }
      )
      if (error) throw this.createAuthError(error)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ user?: User }> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw this.createAuthError(error)
      
      return {
        user: data.user ? this.transformUser(data.user) : undefined
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Refresh session
  async refreshSession(): Promise<AuthSession> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      if (error) throw this.createAuthError(error)
      if (!data.session) throw new Error('No session returned')

      const session = this.transformSession(data.session)
      
      // Update session and tokens
      await this.sessionManager.saveSession(session)
      this.tokenManager.storeSessionTokens(session)
      
      return session
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      const transformedSession = session ? this.transformSession(session) : null
      callback(transformedSession)
    })
  }
  
  // Update profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const { data: { user }, error } = await this.supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw this.createAuthError(error)
      if (!user) throw new Error('No user returned')
      
      return this.transformUser(user)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.from('users').select('count').limit(1)
      return { success: !error, error: error?.message }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }

  // Private helper methods
  private transformSession(session: any): AuthSession {
    return {
      id: session.id || session.user?.id || crypto.randomUUID(),
      user: this.transformUser(session.user),
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in
    }
  }

  private transformUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      role: user.user_metadata?.role || 'customer',
      wallet_balance: user.user_metadata?.wallet_balance || 0,
      kyc_status: user.user_metadata?.kyc_status || 'pending',
      preferred_language: user.user_metadata?.preferred_language || 'en',
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  }

  private createAuthError(error: any): AuthError {
    return {
      message: error.message || 'Authentication error',
      code: error.code,
      details: error
    }
  }

  private handleError(error: any): AuthError {
    if (error.message && error.code) {
      return error // Already an AuthError
    }
    return {
      message: error instanceof Error ? error.message : 'Unknown authentication error',
      details: error
    }
  }

  // Set up automatic session refresh
  private setupSessionRefresh() {
    // Check for session expiry every 5 minutes
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshSession()
    }, 5 * 60 * 1000)
  }
  
  // Check if session needs refresh and refresh if needed
  private async checkAndRefreshSession() {
    try {
      const currentSession = await this.getSession()
      if (!currentSession) return
      
      // Check if session is about to expire (within 10 minutes)
      const expiresAt = currentSession.expires_at
      if (expiresAt && Date.now() + 10 * 60 * 1000 > expiresAt) {
        console.log('Session expiring soon, refreshing...')
        await this.refreshSession()
      }
    } catch (error) {
      console.error('Error checking session expiry:', error)
    }
  }
  
  // Check if session is valid and not expired
  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getSession()
      if (!session) return false
      
      // Check expiry
      if (session.expires_at && Date.now() > session.expires_at) {
        return false
      }
      
      // Validate with token manager
      const accessToken = this.tokenManager.getAccessToken()
      if (!accessToken) return false
      
      return await this.tokenManager.validateToken(accessToken)
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }
  
  // Force refresh session manually
  async forceRefreshSession(): Promise<AuthSession | null> {
    try {
      const refreshToken = this.tokenManager.getRefreshToken()
      if (!refreshToken) {
        console.warn('No refresh token available')
        return null
      }
      
      return await this.refreshSession()
    } catch (error) {
      console.error('Failed to force refresh session:', error)
      return null
    }
  }
  
  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    return this.tokenManager.getAuthHeaders()
  }
  
  // Cleanup method
  destroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }
    
    this.sessionManager.destroy()
    this.tokenManager.destroy()
  }

  // Get the underlying Supabase client for advanced operations
  getSupabaseClient(): SupabaseClient {
    return this.supabase
  }
}