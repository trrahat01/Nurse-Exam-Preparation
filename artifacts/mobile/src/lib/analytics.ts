import { Platform } from 'react-native';

/**
 * Firebase Analytics wrapper (native SDK).
 * Works in production/native builds (APK/AAB), including closed & production.
 * Not available in Expo Go (no native module) — calls are safely ignored there.
 */
let rnfbAnalytics: any = null;
try {
  // Only import on native (not web/Expo Go). require avoids bundling issues on web.
  if (Platform.OS !== 'web') {
    rnfbAnalytics = require('@react-native-firebase/analytics').default;
  }
} catch {
  rnfbAnalytics = null;
}

/** Log an event, e.g. logEvent('app_open') — safely no-ops if analytics is unavailable. */
export async function logEvent(name: string, params?: Record<string, any>): Promise<void> {
  if (!rnfbAnalytics) return;
  try {
    await rnfbAnalytics().logEvent(name, params ?? {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Analytics logEvent failed:', e);
  }
}

/** Track that the app was opened (counts a daily active user). */
export function logAppOpen(source: string): void {
  logEvent('app_open', { source, ts: Date.now() });
}

/** Track a screen view (optional — useful for engagement). */
export function logScreenView(screen: string): void {
  logEvent('screen_view', { screen_name: screen });
}