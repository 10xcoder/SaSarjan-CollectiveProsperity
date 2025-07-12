import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations (bypasses RLS)
let serviceClient: any = null;

export function createSupabaseClient(useServiceRole = false) {
  if (useServiceRole && supabaseServiceKey) {
    if (!serviceClient) {
      serviceClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return serviceClient;
  }
  return supabase;
}