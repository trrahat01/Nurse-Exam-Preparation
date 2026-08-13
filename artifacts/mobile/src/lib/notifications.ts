import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Show banners even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    const version = Constants.expoConfig?.version || '1.3.0';
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
  const ok = await ensureNotificationsPermission();
  if (!ok) return;
  await Promise.allSettled([scheduleDailyReminder(), notifyOnAppUpdate()]);
}