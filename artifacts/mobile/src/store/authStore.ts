import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const guestMode = await AsyncStorage.getItem('guest_mode');
      if (guestMode === 'false') {
        // User was logged in, check if session is still valid
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
            return;
          }
        }
      }
      // Default to guest mode
      await AsyncStorage.setItem('guest_mode', 'true');
      set({ isLoading: false, isGuest: true });
    } catch {
      set({ isLoading: false, isGuest: true });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: { user } } = await supabase.auth.getUser();
    await AsyncStorage.setItem('guest_mode', 'false');
    set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
  },

  signUp: async (email, password, name) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    try { if (supabase) await supabase.auth.signOut(); } catch {}
    await AsyncStorage.setItem('guest_mode', 'true');
    set({ user: null, isAuthenticated: false, isGuest: true });
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem('guest_mode', 'true');
    set({ isGuest: true, isLoading: false });
  },
}));