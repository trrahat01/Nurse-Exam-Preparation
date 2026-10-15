import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleStreakReminder } from './notifications';

const STREAK_KEY = 'study_streak';
const LAST_STUDY_KEY = 'last_study_date';
const BEST_STREAK_KEY = 'best_streak';
const FREEZE_KEY = 'streak_freeze';
const FREEZES_USED_KEY = 'streak_freezes_used';
const LAST_FREEZE_RESET_KEY = 'last_freeze_reset_month';

/** Local YYYY-MM-DD (avoids TZ issues). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
/** Local YYYY-MM for monthly resets. */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
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
    // If the user missed a full day (last study is BEFORE yesterday), snapshot
    // the streak so we can offer a rewarded-ad "streak freeze".
    if (cur > 0 && last && last < yesterday(t)) {
      await saveStreakFreeze(cur, last);
    }
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

export interface StreakFreezeInfo {
  /** Streak value that was saved right before it would have reset. */
  frozenStreak: number;
  /** The last date the user actually studied before the gap. */
  frozenDate: string;
  /** True when the freeze is still usable (not used up). */
  available: boolean;
}

/**
 * Returns the currently-saved streak freeze (if any) and whether it's usable.
 * A freeze is "available" when today is >1 day after the last study date.
 */
export async function getStreakFreeze(): Promise<StreakFreezeInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(FREEZE_KEY);
    let used = parseInt((await AsyncStorage.getItem(FREEZES_USED_KEY)) || '0', 10) || 0;
    const lastReset = await AsyncStorage.getItem(LAST_FREEZE_RESET_KEY);
    const thisMonth = currentMonth();

    if (lastReset !== thisMonth) {
      used = 0;
      await AsyncStorage.setItem(FREEZES_USED_KEY, '0');
      await AsyncStorage.setItem(LAST_FREEZE_RESET_KEY, thisMonth);
    }

    if (!raw) return null;
    const parsed = JSON.parse(raw) as { frozenStreak: number; frozenDate: string };
    if (!parsed || !parsed.frozenStreak) return null;
    const available = used < 3 && yesterday(today()) > parsed.frozenDate;
    return { ...parsed, available };
  } catch {
    return null;
  }
}

/**
 * Persists the streak freeze (called automatically when a gap is detected in
 * getStreak — see README). Keeps the streak value so it can be restored.
 */
export async function saveStreakFreeze(streak: number, lastDate: string): Promise<void> {
  try {
    await AsyncStorage.setItem(FREEZE_KEY, JSON.stringify({ frozenStreak: streak, frozenDate: lastDate }));
  } catch {
    /* ignore */
  }
}

/**
 * Restores a frozen streak (after the user watched a rewarded ad).
 * Sets the streak back to its frozen value and counts today as studied so a
 * freeze never runs twice on the same gap.
 */
export async function consumeStreakFreeze(): Promise<StreakData> {
  const info = await getStreakFreeze();
  const best = parseInt((await AsyncStorage.getItem(BEST_STREAK_KEY)) || '0', 10) || 0;
  try {
    if (info) {
      await AsyncStorage.setItem(STREAK_KEY, String(info.frozenStreak));
      await AsyncStorage.setItem(LAST_STUDY_KEY, yesterday(today()));
      // Drop the freeze snapshot so the restore card never reappears for the
      // same gap (the used counter is the safety net across different gaps).
      await AsyncStorage.removeItem(FREEZE_KEY);
    }
    const used = parseInt((await AsyncStorage.getItem(FREEZES_USED_KEY)) || '0', 10) || 0;
    await AsyncStorage.setItem(FREEZES_USED_KEY, String(used + 1));
    const restored = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0', 10) || 0;
    return { current: restored, best: Math.max(best, restored), lastDate: yesterday(today()), studiedToday: false };
  } catch {
    return { current: 0, best: 0, lastDate: null, studiedToday: false };
  }
}