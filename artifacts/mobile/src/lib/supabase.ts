import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabaseClient: SupabaseClient | null = null;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isValidSupabaseKey = (key: string) => {
  return key && (key.startsWith('eyJ') || key.startsWith('sb_publishable_'));
};

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseClient) return _supabaseClient;
  if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseKey(supabaseAnonKey)) {
    return null;
  }
  try {
    // Dynamic import to avoid crashes on startup
    const { createClient } = require('@supabase/supabase-js');
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    return _supabaseClient;
  } catch {
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && isValidSupabaseKey(supabaseAnonKey));
};