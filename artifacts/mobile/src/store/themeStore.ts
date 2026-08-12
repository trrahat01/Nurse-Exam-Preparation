import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'theme_pref';

function applyTheme(t: ThemePreference) {
  // null = follow system
  Appearance.setColorScheme(t === 'system' ? null : t);
}

interface ThemeState {
  theme: ThemePreference;
  loadTheme: () => Promise<void>;
  setTheme: (t: ThemePreference) => Promise<void>;
  toggle: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  loadTheme: async () => {
    try {
      const stored = (await AsyncStorage.getItem(KEY)) as ThemePreference | null;
      const t = stored || 'system';
      applyTheme(t);
      set({ theme: t });
    } catch {
      applyTheme('system');
      set({ theme: 'system' });
    }
  },
  setTheme: async (t) => {
    applyTheme(t);
    set({ theme: t });
    try { await AsyncStorage.setItem(KEY, t); } catch {}
  },
  toggle: async () => {
    const { theme } = get();
    const next = theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },
}));