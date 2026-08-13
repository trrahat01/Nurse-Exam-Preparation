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
  signUp: (email: string, password: string, name: string) => Promise<{ needsEmailConfirmation: boolean }>;
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
    const supabase = getSupabaseClient();
    let finished = false;

    const finishAsGuest = async () => {
      if (finished) return;
      finished = true;
      const guestMode = await AsyncStorage.getItem('guest_mode');
      if (guestMode === 'false') await AsyncStorage.setItem('guest_mode', 'true');
      set({ isLoading: false, isGuest: true, user: null, isAuthenticated: false });
    };

    if (!supabase) { await finishAsGuest(); return; }

    try {
      // Restore any persisted session the moment Supabase loads it from storage.
      // onAuthStateChange reliably fires with the saved session (INITIAL_SESSION /
      // SIGNED_IN) even on cold start, fixing the getSession() race that caused
      // users to appear logged-out after leaving & reopening the app.
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          finished = true;
          AsyncStorage.setItem('guest_mode', 'false');
          set({ user: session.user, isAuthenticated: true, isGuest: false, isLoading: false });
        } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          finishAsGuest();
        }
      });

      // Fallback direct read for the already-loaded session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        finished = true;
        await AsyncStorage.setItem('guest_mode', 'false');
        set({ user: session.user, isAuthenticated: true, isGuest: false, isLoading: false });
      } else {
        // Give the listener a moment to deliver the restored session, then fall
        // back to guest so the app never hangs on a blank/loading state.
        setTimeout(() => finishAsGuest(), 1500);
      }
    } catch {
      await finishAsGuest();
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
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('email_not_confirmed')) {
        throw new Error('Please verify your email first. Check your inbox (and spam) for the verification link we sent.');
      }
      throw error;
    }
    const { data: { user } } = await supabase.auth.getUser();
    await AsyncStorage.setItem('guest_mode', 'false');
    set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
  },

  signUp: async (email, password, name) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;

    // If a session was returned, email confirmation is NOT required → auto-login.
    if (data.session) {
      await AsyncStorage.setItem('guest_mode', 'false');
      set({ user: data.user, isAuthenticated: true, isGuest: false, isLoading: false });
      return { needsEmailConfirmation: false };
    }
    // No session → the user must confirm their email before signing in.
    return { needsEmailConfirmation: true };
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