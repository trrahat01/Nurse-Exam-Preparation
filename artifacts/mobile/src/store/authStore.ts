import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Models } from 'appwrite';
import {
  account,
  appwriteClient,
  ID,
  isAppwriteConfigured,
  getRedirectBase,
  saveSessionToken,
  getStoredSessionToken,
  clearStoredSessionToken,
} from '@/src/lib/appwrite';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsEmailConfirmation: boolean }>;
  verifyEmail: () => Promise<void>;
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
    let finished = false;
    const finishGuest = async () => {
      if (finished) return;
      finished = true;
      const guestMode = await AsyncStorage.getItem('guest_mode');
      if (guestMode === 'false') await AsyncStorage.setItem('guest_mode', 'true');
      set({ isLoading: false, isGuest: true, user: null, isAuthenticated: false });
    };

    if (!isAppwriteConfigured()) { await finishGuest(); return; }

    try {
      const token = await getStoredSessionToken();
      if (token) {
        appwriteClient.setSession(token);
        try {
          const user = await account.get();
          await AsyncStorage.setItem('guest_mode', 'false');
          set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
          return;
        } catch {
          await clearStoredSessionToken();
        }
      }
      await finishGuest();
    } catch {
      await finishGuest();
    }
  },

  signIn: async (email, password) => {
    if (!isAppwriteConfigured()) throw new Error('Appwrite not configured');
    const session = await account.createEmailPasswordSession(email.trim().toLowerCase(), password);
    await saveSessionToken(session.secret);
    appwriteClient.setSession(session.secret);
    const user = await account.get();
    await AsyncStorage.setItem('guest_mode', 'false');
    set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
    if (!user.emailVerification) {
      try { await account.createVerification(getRedirectBase() + '/verify.html'); } catch {}
    }
  },

  signUp: async (email, password, name) => {
    if (!isAppwriteConfigured()) throw new Error('Appwrite not configured');
    const user = await account.create(ID.unique(), email.trim().toLowerCase(), password, name);
    // Appwrite: send a verification email.
    try { await account.createVerification(getRedirectBase() + '/verify.html'); } catch {}
    set({ user, isAuthenticated: false, isGuest: false });
    return { needsEmailConfirmation: !user.emailVerification };
  },

  verifyEmail: async () => {
    if (!isAppwriteConfigured()) return;
    try { await account.createVerification(getRedirectBase() + '/verify.html'); } catch {}
  },

  signOut: async () => {
    try { await account.deleteSession('current'); } catch {}
    await clearStoredSessionToken();
    await AsyncStorage.setItem('guest_mode', 'true');
    set({ user: null, isAuthenticated: false, isGuest: true });
  },

  resetPassword: async (email) => {
    if (!isAppwriteConfigured()) throw new Error('Appwrite not configured');
    await account.createRecovery(email.trim().toLowerCase(), getRedirectBase() + '/reset.html');
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem('guest_mode', 'true');
    set({ isGuest: true, isLoading: false });
  },
}));
