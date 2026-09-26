import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'theme_pref';

/** Resolve the actual active scheme ('light' | 'dark') from a preference. */
export function resolveScheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  // 'system' → follow the OS setting (platform read-only helper).
  try {
    return Appearance.getColorScheme() ?? 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(t: ThemePreference) {
  // null = follow system
  try { Appearance.setColorScheme(t === 'system' ? null : t); } catch { /* ignore */ }
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
    // Toggle the RESOLVED scheme so "system" users get a concrete choice.
    const active = resolveScheme(theme);
    const next = active === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },
}));