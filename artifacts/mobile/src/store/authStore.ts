import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firebaseConfigured } from '@/src/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';

export interface AuthUser {
  uid: string;
  $id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  email_verified: boolean;
  emailVerification: boolean;
}

function toUser(u: any): AuthUser | null {
  if (!u) return null;
  return {
    uid: u.uid,
    $id: u.uid,
    name: u.displayName || '',
    email: u.email || '',
    emailVerified: !!u.emailVerified,
    email_verified: !!u.emailVerified,
    emailVerification: !!u.emailVerified,
  };
}

interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsEmailConfirmation: boolean }>;
  resendVerification: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  let unsub: (() => void) | null = null;

  return {
    user: null,
    isGuest: false,
    isLoading: true,
    isAuthenticated: false,

    initialize: async () => {
      const finishGuest = async () => {
        const guestMode = await AsyncStorage.getItem('guest_mode');
        if (guestMode === 'false') await AsyncStorage.setItem('guest_mode', 'true');
        set({ isLoading: false, isGuest: true, user: null, isAuthenticated: false });
      };

      // No Firebase keys configured yet → run in guest/offline mode.
      if (!firebaseConfigured || !auth) { await finishGuest(); return; }

      unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          await AsyncStorage.setItem('guest_mode', 'false');
          set({ user: toUser(u), isAuthenticated: true, isGuest: false, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false });
          await finishGuest();
        }
      });
    },

    signIn: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured.');
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await AsyncStorage.setItem('guest_mode', 'false');
      // onAuthStateChanged updates the user.
    },

    signUp: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured.');
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      try { await sendEmailVerification(cred.user); } catch (e) { console.warn('sendEmailVerification failed', e); }
      set({ user: toUser(cred.user), isGuest: false, isAuthenticated: true });
      return { needsEmailConfirmation: true };
    },

    resendVerification: async () => {
      if (!auth?.currentUser) throw new Error('Sign in first, then resend the verification email.');
      await sendEmailVerification(auth.currentUser);
    },

    resetPassword: async (email) => {
      if (!auth) throw new Error('Firebase is not configured.');
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    },

    signOut: async () => {
      try { if (auth) await fbSignOut(auth); } catch { /* ignore */ }
      await AsyncStorage.setItem('guest_mode', 'true');
      set({ user: null, isAuthenticated: false, isGuest: true });
    },

    continueAsGuest: async () => {
      await AsyncStorage.setItem('guest_mode', 'true');
      set({ isGuest: true, isLoading: false });
    },
  };
});