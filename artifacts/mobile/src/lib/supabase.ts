import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

/** True once real Supabase credentials are provided in config.ts. */
export const supabaseConfigured =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.startsWith('YOUR_');

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;