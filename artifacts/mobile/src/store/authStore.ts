import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
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
      // Check if guest mode was saved
      const guest = await AsyncStorage.getItem('guest_mode');
      if (guest === 'true') {
        set({ isLoading: false, isGuest: true });
        return;
      }
      
      if (!isSupabaseConfigured()) { 
        await AsyncStorage.setItem('guest_mode', 'true');
        set({ isLoading: false, isGuest: true }); 
        return; 
      }
      
      // Try to restore session - catch auth errors gracefully
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({ user: session.user, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch (authErr: unknown) {
        // Auth failed (invalid key, network, etc) - auto guest mode
        console.warn('Auth init failed:', authErr instanceof Error ? authErr.message : String(authErr));
      }
      
      // No session or auth failed - auto guest mode
      await AsyncStorage.setItem('guest_mode', 'true');
      set({ isLoading: false, isGuest: true });
    } catch { 
      await AsyncStorage.setItem('guest_mode', 'true');
      set({ isLoading: false, isGuest: true }); 
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: { user } } = await supabase.auth.getUser();
    await AsyncStorage.setItem('guest_mode', 'false');
    set({ user, isAuthenticated: true, isGuest: false });
  },

  signUp: async (email, password, name) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
  },

  signOut: async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    await AsyncStorage.setItem('guest_mode', 'false');
    set({ user: null, isAuthenticated: false, isGuest: false });
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem('guest_mode', 'true');
    set({ isGuest: true, isLoading: false });
  },
}));
