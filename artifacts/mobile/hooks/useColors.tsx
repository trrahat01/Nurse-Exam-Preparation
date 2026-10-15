import { useThemeStore } from '@/src/store/themeStore';
import { resolveScheme } from '@/src/store/themeStore';

export function useColors() {
  const theme = useThemeStore((s) => s.theme);
  const scheme = resolveScheme(theme);
  const isDark = scheme === 'dark';

  // Define light and dark color values based on the app's design (guess)
  const lightColors = {
    background: '#F8FAFC',
    foreground: '#0C1A2E',
    mutedForeground: '#64748B',
    text: '#0C1A2E',
    card: '#fff',
    border: '#E2E8F0',
    primary: '#0891B2',
    primaryForeground: '#fff',
    secondary: '#F8FAFC',
  };
  const darkColors = {
    background: '#0C1A2E',
    foreground: '#fff',
    mutedForeground: '#BAE6FD',
    text: '#fff',
    card: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    primary: '#0891B2', // maybe keep same
    primaryForeground: '#fff',
    secondary: '#1E293B',
  };

  return isDark ? darkColors : lightColors;
}