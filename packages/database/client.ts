import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function createSupabaseClient() {
  return supabase;
}