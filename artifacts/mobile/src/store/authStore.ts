import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  uid: string;
  $id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  email_verified: boolean;
  emailVerification: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

/**
 * Guest-only auth store.
 *
 * The app does NOT offer account creation, sign-in, or sign-out. All progress
 * (bookmarks, exam results, streaks, wrong answers, XP/badges) is stored locally
 * on the device via AsyncStorage. This store exists so screens that previously
 * depended on a signed-in user keep working with an always-guest identity.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: true,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      await AsyncStorage.setItem('guest_mode', 'true');
    } catch { /* ignore */ }
    set({ isLoading: false, isGuest: true, user: null, isAuthenticated: false });
  },

  continueAsGuest: async () => {
    try {
      await AsyncStorage.setItem('guest_mode', 'true');
    } catch { /* ignore */ }
    set({ isGuest: true, isLoading: false, user: null, isAuthenticated: false });
  },
}));