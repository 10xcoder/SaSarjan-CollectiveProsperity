import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { jwtVerify, SignJWT } from 'jose'
import type { AuthConfig, User, AuthSession } from '../types'

export class AuthServer {
  private supabase: SupabaseClient
  private config: AuthConfig
  private jwtSecret: Uint8Array

  constructor(config: AuthConfig & { serviceRoleKey: string; jwtSecret: string }) {
    this.config = config
    this.jwtSecret = new TextEncoder().encode(config.jwtSecret)
    
    // Use service role key for server-side operations
    this.supabase = createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  // Verify and decode JWT token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret)
      return payload.user as User
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  // Create a new JWT token for user
  async createToken(user: User, expiresIn: string = '24h'): Promise<string> {
    try {
      const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(this.jwtSecret)
      
      return token
    } catch (error) {
      console.error('Token creation failed:', error)
      throw new Error('Failed to create token')
    }
  }

  // Get user by ID (server-side)
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  // Update user profile (server-side)
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in updateUser:', error)
      return null
    }
  }

  // Create user profile (usually called after registration)
  async createUserProfile(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return null
    }
  }

  // Validate session server-side
  async validateSession(accessToken: string): Promise<{ user: User; session: AuthSession } | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser(accessToken)
      
      if (error || !data.user) {
        return null
      }

      // Get full user profile from our users table
      const userProfile = await this.getUserById(data.user.id)
      
      if (!userProfile) {
        return null
      }

      const session: AuthSession = {
        id: userProfile.id,
        user: userProfile,
        access_token: accessToken,
        refresh_token: '', // Not available server-side
        expires_at: 0, // Would need to decode JWT to get this
        expires_in: 0
      }

      return { user: userProfile, session }
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  // Admin function to get all users
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      return data as User[]
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  // Admin function to update user role
  async updateUserRole(userId: string, role: User['role']): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{ total: number; byRole: Record<string, number> }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role')

      if (error) {
        console.error('Error fetching user stats:', error)
        return { total: 0, byRole: {} }
      }

      const byRole = data.reduce((acc: Record<string, number>, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})

      return { total: data.length, byRole }
    } catch (error) {
      console.error('Error in getUserStats:', error)
      return { total: 0, byRole: {} }
    }
  }

  // Test database connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)

      return { success: !error, error: error?.message }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }

  // Get the underlying Supabase client for advanced operations
  getSupabaseClient(): SupabaseClient {
    return this.supabase
  }
}