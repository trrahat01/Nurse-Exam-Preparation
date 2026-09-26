import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore, resolveScheme } from '@/src/store/themeStore';

/**
 * Returns the design tokens for the active color scheme.
 *
 * The active scheme resolves in this priority order:
 *   1. The user's explicit choice in Settings (themeStore: 'light' | 'dark').
 *   2. The device's OS appearance setting when theme = 'system'.
 *
 * This guarantees the app is FULLY dark when Dark Mode is enabled — every
 * screen that renders through these tokens switches together, instead of only
 * reflecting the OS scheme (which is why dark mode previously appeared broken).
 */
export function useColors() {
  const osScheme = useColorScheme();
  const theme = useThemeStore((s) => s.theme);
  const scheme = theme === 'system' ? (osScheme ?? 'light') : resolveScheme(theme);
  const themeColors = colors as { light: typeof colors.light; dark?: typeof colors.light; radius: number };
  const palette = scheme === 'dark' && themeColors.dark ? themeColors.dark : themeColors.light;
  return { ...palette, radius: colors.radius, scheme };
}
