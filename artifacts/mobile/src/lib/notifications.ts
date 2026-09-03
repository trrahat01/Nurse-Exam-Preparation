import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// In Expo Go, local/remote notifications are not fully supported (SDK 53+).
// Skip setting the handler so we don't trigger Expo Go's push error at startup.
if (!IS_EXPO_GO) {
  // Show banners even when the app is in the foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const DAILY_REMINDER_ID = 'daily-reminder';

/**
 * Creates Android notification channels (iOS ignores these).
 */
async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily Reminder',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync('updates', {
    name: 'App Updates',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Requests permission. Returns true if we may send notifications.
 */
export async function ensureNotificationsPermission(): Promise<boolean> {
  await ensureChannels();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/**
 * Schedules a repeating daily reminder (defaults to 8:00 PM) so the user gets
 * at least one notification every day for reading/practice.
 */
export async function scheduleDailyReminder(hour = 20, minute = 0): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {}
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: '📖 Time for your daily reading',
        body: 'Open Nurse Exam Preparation for today\'s reading and practice. Consistency beats intensity!',
        sound: true,
      },
      trigger: {
        channelId: 'daily',
        hour,
        minute,
        repeats: true,
      } as any,
    });
  } catch (e) {
    console.warn('scheduleDailyReminder failed:', e);
  }
}

/**
 * Sends a one-time "app updated" notification the first time a new version runs.
 * Stores the last announced version in AsyncStorage.
 */
export async function notifyOnAppUpdate(): Promise<void> {
  try {
    const version = Constants.expoConfig?.version || '1.4.0';
    const key = 'last_announced_version';
    const last = await AsyncStorage.getItem(key);
    if (last === version) return;
    await AsyncStorage.setItem(key, version);
    // Give the user a moment after opening, then notify about the update.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'App updated! 🚀',
        body: `Nurse Exam Preparation ${version} is here. Check out what\'s new.`,
        sound: true,
      },
      trigger: {
        channelId: 'updates',
        seconds: 60,
      } as any,
    });
  } catch (e) {
    console.warn('notifyOnAppUpdate failed:', e);
  }
}

export async function setupNotifications(): Promise<void> {
  if (IS_EXPO_GO) return; // Expo Go doesn't support local/remote notifications
  const ok = await ensureNotificationsPermission();
  if (!ok) return;
  await Promise.allSettled([scheduleDailyReminder(), notifyOnAppUpdate()]);
}

/** Cancel the daily reminder (called when the user turns notifications off). */
export async function cancelDailyReminder(): Promise<void> {
  try { await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID); } catch {}
  try { await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID); } catch {}
}

// ── Streak reminder ─────────────────────────────────────────

const STREAK_REMINDER_ID = 'streak-reminder';
const NOTIF_PREF_KEY = 'notifications_enabled';

/** Read the user's notification preference (default: on). */
export async function getNotificationPref(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(NOTIF_PREF_KEY);
    return v === null ? true : v === 'true';
  } catch { return true; }
}

/** Store the user's notification preference. */
export async function setNotificationPref(on: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIF_PREF_KEY, on ? 'true' : 'false');
}

/**
 * Schedules a daily "streak" reminder showing the user's current streak fire.
 * Call after the streak changes so the number is fresh each day.
 */
export async function scheduleStreakReminder(streak: number): Promise<void> {
  try { await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID); } catch {}
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_REMINDER_ID,
      content: {
        title: streak > 0 ? `🔥 Day ${streak} — take your 20 questions` : '📚 Ready for today\u2019s practice?',
        body: `Day ${streak}: open the app and answer your 20 daily questions to keep the streak alive!`,
        sound: true,
      },
      trigger: { channelId: 'daily', hour: 20, minute: 0, repeats: true } as any,
    });
  } catch (e) {
    console.warn('scheduleStreakReminder failed:', e);
  }
}