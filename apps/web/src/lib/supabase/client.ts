import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'sasarjan-appstore@1.0.0'
    }
  }
})

// Utility functions for common operations
export const supabaseUtils = {
  // Test connection
  async testConnection() {
    try {
      const { data: _data, error } = await supabase.from('users').select('count').limit(1)
      return { success: !error, error: error?.message }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  },

  // Auth helpers
  auth: {
    async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
    },

    async signIn(email: string, password: string) {
      return await supabase.auth.signInWithPassword({
        email,
        password
      })
    },

    async signOut() {
      return await supabase.auth.signOut()
    },

    async getUser() {
      return await supabase.auth.getUser()
    },

    async getSession() {
      return await supabase.auth.getSession()
    }
  },

  // User helpers
  users: {
    async getProfile(userId: string) {
      return await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
    },

    async updateProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
      return await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    },

    async createProfile(user: Database['public']['Tables']['users']['Insert']) {
      return await supabase
        .from('users')
        .insert(user)
        .select()
        .single()
    }
  },

  // App helpers
  apps: {
    async getPublicApps(limit = 20, offset = 0) {
      return await supabase
        .from('apps')
        .select(`
          *,
          developers (
            id,
            company_name,
            users (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    },

    async getAppById(id: string) {
      return await supabase
        .from('apps')
        .select(`
          *,
          developers (
            id,
            company_name,
            users (
              full_name,
              avatar_url
            )
          ),
          app_tags (
            tags (
              name,
              slug,
              category
            )
          )
        `)
        .eq('id', id)
        .single()
    },

    async searchApps(query: string, category?: string) {
      let queryBuilder = supabase
        .from('apps')
        .select(`
          *,
          developers (
            company_name,
            users (
              full_name
            )
          )
        `)
        .eq('status', 'approved')
        .textSearch('name', query)

      if (category) {
        queryBuilder = queryBuilder.eq('category', category)
      }

      return await queryBuilder.order('average_rating', { ascending: false })
    }
  },

  // Success stories helpers
  stories: {
    async getLatestStories(limit = 10) {
      return await supabase
        .from('success_stories')
        .select(`
          *,
          users!author_id (
            full_name,
            avatar_url
          ),
          apps!internal_app_id (
            name,
            icon_url
          ),
          external_apps!external_app_id (
            name,
            platform
          )
        `)
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(limit)
    }
  }
}

// Export default client
export default supabase