import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabaseClient: SupabaseClient | null = null;

// Read from environment variables first, then fall back to app.json extra
const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Get values from app.json extra (expo-constants)
const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as Record<string, string>;

const supabaseUrl = envUrl || extra.supabaseUrl || '';
const supabaseAnonKey = envKey || extra.supabaseAnonKey || '';

const isValidSupabaseKey = (key: string) => {
  return key && (key.startsWith('eyJ') || key.startsWith('sb_publishable_'));
};

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseClient) return _supabaseClient;
  if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseKey(supabaseAnonKey)) {
    console.warn('Supabase not configured. Check .env or app.json extra values.');
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
  } catch (e) {
    console.warn('Failed to create Supabase client:', e);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && isValidSupabaseKey(supabaseAnonKey));
};