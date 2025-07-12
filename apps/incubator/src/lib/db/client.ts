// Database client configuration for Incubator.in
// Uses Supabase as the primary database

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton database client
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false // For server-side usage
    }
  })

  return supabaseClient
}

// Server-side client with service role key for admin operations
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    const { error } = await client
      .from('incubators')
      .select('id')
      .limit(1)
    
    return !error
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Migration utilities
export async function runMigration(migrationSql: string): Promise<void> {
  const client = getSupabaseAdminClient()
  
  const { error } = await client.rpc('execute_sql', {
    sql: migrationSql
  })
  
  if (error) {
    throw new Error(`Migration failed: ${error.message}`)
  }
}

// Utility function for handling Supabase errors
export function handleDatabaseError(error: any): Error {
  if (error?.code === 'PGRST116') {
    return new Error('No data found')
  }
  
  if (error?.code === '23505') {
    return new Error('Duplicate entry')
  }
  
  if (error?.code === '23503') {
    return new Error('Referenced record not found')
  }
  
  return new Error(error?.message || 'Database operation failed')
}

// Type-safe database operations with error handling
export async function safeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await operation()
    
    if (error) {
      throw handleDatabaseError(error)
    }
    
    if (!data) {
      throw new Error('No data returned from database')
    }
    
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown database error occurred')
  }
}