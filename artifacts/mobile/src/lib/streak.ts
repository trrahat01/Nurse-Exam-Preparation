import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleStreakReminder } from './notifications';

const STREAK_KEY = 'study_streak';
const LAST_STUDY_KEY = 'last_study_date';
const BEST_STREAK_KEY = 'best_streak';

/** Local YYYY-MM-DD (avoids TZ issues). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterday(day: string): string {
  const d = new Date(day + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface StreakData {
  current: number;
  best: number;
  lastDate: string | null;
  studiedToday: boolean;
}

export async function getStreak(): Promise<StreakData> {
  try {
    const cur = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0', 10) || 0;
    const best = parseInt((await AsyncStorage.getItem(BEST_STREAK_KEY)) || '0', 10) || 0;
    const last = await AsyncStorage.getItem(LAST_STUDY_KEY);
    const t = today();
    return { current: cur, best, lastDate: last, studiedToday: last === t };
  } catch {
    return { current: 0, best: 0, lastDate: null, studiedToday: false };
  }
}

/** Call after finishing a study/practice session to advance the streak. */
export async function markStudied(): Promise<StreakData> {
  try {
    const t = today();
    const last = await AsyncStorage.getItem(LAST_STUDY_KEY);
    const cur = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0', 10) || 0;
    const best = parseInt((await AsyncStorage.getItem(BEST_STREAK_KEY)) || '0', 10) || 0;

    let next = cur;
    if (last === t) {
      // already counted today
    } else if (last === yesterday(t)) {
      next = cur + 1; // consecutive
    } else {
      next = 1; // new streak / resumed
    }
    if (next > best) {
      await AsyncStorage.setItem(BEST_STREAK_KEY, String(next));
    }
    await AsyncStorage.setItem(STREAK_KEY, String(next));
    await AsyncStorage.setItem(LAST_STUDY_KEY, t);
    // Refresh the streak reminder so the "Day N" number stays current.
    scheduleStreakReminder(next);
    return { current: next, best: Math.max(best, next), lastDate: t, studiedToday: true };
  } catch {
    return { current: 0, best: 0, lastDate: null, studiedToday: false };
  }
}