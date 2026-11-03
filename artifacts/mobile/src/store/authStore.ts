import { create } from 'zustand';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/lib/supabase';
import type { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const linkingScheme = Linking.createURL('auth-callback');
type InitStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'networkError' | 'configError' | 'authError';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initStatus: InitStatus;
  initialize: () => Promise<void>;
  retryInitialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  linkGuestEmail: (email: string, name: string) => Promise<void>;
  setGuestPassword: (password: string, originalAnonymousId: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  verifyOtp: (params: { token?: string; token_hash?: string; type?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  isAuthenticated: false,

  initStatus: 'loading',\n\n  initialize: async () => {
    // Restore any existing Supabase session without assuming guest mode.
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Supabase not configured – treat as unauthenticated.
      set({ isLoading: false, isAuthenticated: false, isGuest: false, user: null, initStatus: 'configError' });
      return;
    }
    set({ initStatus: 'loading' });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        // Never treat a failed network request as proof that no session exists.
        if (error.message.includes('fetch') || error.status === 0) {
          console.error('Network error during session restoration:', error);
          set({ isLoading: false, initStatus: 'networkError' });
          return;
        }
        throw error;
      }

      if (session?.user) {
        const user = session.user;
        // Determine if the user is an anonymous guest.
        const isGuest = !!user?.is_anonymous;
        set({ user, isAuthenticated: true, isGuest, isLoading: false, initStatus: 'authenticated' });
        return;
      }
    } catch (e) {
      console.error('Error restoring Supabase session:', e);
      set({ initStatus: 'authError' });
      return;
    }
    // No valid session – remain unauthenticated until user chooses.
    set({ isLoading: false, isAuthenticated: false, isGuest: false, user: null, initStatus: 'unauthenticated' });
  },

  retryInitialize: async () => {
    set({ initStatus: 'loading', isLoading: true });
    try {
      await get().initialize();
      set({ isLoading: false });
    } catch (e) {
      console.error('Retry initialization failed:', e);
      set({ isLoading: false });
      throw e;
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    set({ user: data.user, isAuthenticated: true, isGuest: false, isLoading: false });
  },

  signUp: async (email, password, name) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    
    // If the user is currently an anonymous guest, upgrade via linkGuestEmail
    const currentUser = get().user;
    if (currentUser?.is_anonymous) {
      return get().linkGuestEmail(email, name);
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { full_name: name } 
      } 
    });
    
    if (error) throw error;

    if (data.session) {
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isGuest: !!data.user?.is_anonymous, 
        isLoading: false 
      });
    }
  },

  linkGuestEmail: async (email, name) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client unavailable');

    const currentUser = get().user;
    if (!currentUser || !currentUser.is_anonymous) {
      throw new Error('No active guest session found.');
    }

    const originalUserId = currentUser.id;

    const { data, error } = await supabase.auth.updateUser(
      {
        email,
        data: { full_name: name },
      },
      {
        emailRedirectTo: linkingScheme,
      }
    );

    if (error) throw error;
    if (!data.user) throw new Error('Email linking failed: No user data returned.');
    
    if (data.user.id !== originalUserId) {
      throw new Error('Email linking failed: User ID mismatch.');
    }

    // Keep isGuest: true while verification is pending.
    // The account remains a guest account until email is verified and password is set.
    set({ user: data.user, isAuthenticated: true, isGuest: true, isLoading: false });
  },

  setGuestPassword: async (password, originalAnonymousId) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client unavailable');

    // Retrieve the current user and verify its UUID matches originalAnonymousId.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error('No active session found.');

    const user = session.user;
    if (user.id !== originalAnonymousId) {
      throw new Error('Password setup failed: User ID mismatch.');
    }

    // Verify the email identity is actually linked and confirmed.
    if (!user.email_confirmed_at) {
      throw new Error('Please verify your email before setting a password.');
    }

    // Call only password update.
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
    if (!data.user) throw new Error('Password setup failed: No user data returned.');
    
    if (data.user.id !== originalAnonymousId) {
      throw new Error('Password setup failed: User ID mismatch after update.');
    }

    // Confirm the account is no longer anonymous.
    set({
      user: data.user,
      isAuthenticated: true,
      isGuest: !!data.user.is_anonymous,
      isLoading: false
    });
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Make sign-out errors visible instead of silently swallowing them.
        throw error;
      }
    }
    // Do not create a guest session automatically.
    set({ user: null, isAuthenticated: false, isGuest: false, isLoading: false });
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  verifyOtp: async (params: { token?: string; token_hash?: string; type?: string }) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    // Determine verification flow based on parameters
    const verifyParams: any = {};
    if (params.token_hash) {
      verifyParams.token_hash = params.token_hash;
      verifyParams.type = params.type || 'email';
    } else if (params.token) {
      verifyParams.token = params.token;
      verifyParams.type = params.type || 'email';
    } else {
      throw new Error('No verification token or token_hash provided');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      ...verifyParams,
      options: {
        redirectTo: linkingScheme,
      },
    });
    if (error) throw error;

    // If a session is returned, update the store directly and enforce UUID continuity
    if (data.session) {
      const user = data.session.user;
      const isGuest = !!user.is_anonymous;
      const originalAnonymousId = get().user?.id;

      // Verify UUID continuity
      if (originalAnonymousId && user.id !== originalAnonymousId) {
        throw new Error('Verification failed: User ID changed during verification.');
      }

      // Ensure email is confirmed for email_change flows
      if (params.type === 'email_change' && !user.email_confirmed_at) {
        throw new Error('Please confirm your new email address.');
      }

      set({ user, isAuthenticated: true, isGuest, isLoading: false });
    }
  },

  continueAsGuest: async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client unavailable');
    }
    
    // Reuse existing anonymous session if present.
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.is_anonymous) {
      set({ user: session.user, isAuthenticated: true, isGuest: true, isLoading: false });
      return;
    }
    
    // No session – attempt anonymous sign‑in.
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw new Error(error.message ?? 'Anonymous sign‑in failed');
    }
    if (!data?.user) {
      throw new Error('Anonymous sign‑in did not return a user');
    }
    set({ user: data.user, isAuthenticated: true, isGuest: true, isLoading: false });
  },
}));







