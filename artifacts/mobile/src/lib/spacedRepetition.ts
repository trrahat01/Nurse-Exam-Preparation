import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWrongAnswers, removeWrongAnswer, type WrongItem } from './wrongAnswers';

const SCHEDULE_KEY = 'spaced_repetition_schedule';

/**
 * Lightweight SM-2-style spaced repetition built on the Weak Topics bank.
 *
 * Each wrong-answer item is scheduled with increasing intervals: 1d → 3d → 7d → 15d.
 * A correct answer in a "smart review" session advances the item to the next
 * interval; a wrong answer resets it to day 1. When today's date passes an item's
 * next review date, it appears in the "Smart Review" queue.
 */

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 15];

export interface ReviewScheduleEntry {
  id: string;
  reps: number; // number of successful reviews so far
  nextReviewAt: string; // ISO date (YYYY-MM-DD) when it's due again
  lastReviewedAt?: string; // ISO datetime of the last review
}

export interface SmartReviewItem extends WrongItem {
  reps: number;
  nextReviewAt: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readSchedule(): Promise<Record<string, ReviewScheduleEntry>> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeSchedule(map: Record<string, ReviewScheduleEntry>): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/**
 * Initializes the schedule entry for a wrong answer the first time it is seen.
 * Keeps an existing schedule (so re-missing a mastered item doesn't lose reps
 * unless the wrong-answer bank was updated).
 */
export async function ensureSchedule(ids: string[]): Promise<void> {
  try {
    const map = await readSchedule();
    let changed = false;
    const today = todayStr();
    for (const id of ids) {
      if (!map[id]) {
        map[id] = { id, reps: 0, nextReviewAt: today };
        changed = true;
      }
    }
    if (changed) await writeSchedule(map);
  } catch {
    /* ignore */
  }
}

/** Items from the wrong bank that are currently due (today or earlier). */
export async function getSmartReviewQueue(): Promise<SmartReviewItem[]> {
  try {
    const [wrong, map] = await Promise.all([getWrongAnswers(), readSchedule()]);
    const today = todayStr();
    const items: SmartReviewItem[] = [];
    for (const w of wrong) {
      const entry = map[w.id];
      const next = entry?.nextReviewAt ?? today;
      if (next <= today) {
        items.push({ ...w, reps: entry?.reps ?? 0, nextReviewAt: next });
      }
    }
    // Most-due first, then most-frequently-wrong first.
    return items.sort((a, b) =>
      a.nextReviewAt.localeCompare(b.nextReviewAt) || b.wrong_count - a.wrong_count);
  } catch {
    return [];
  }
}

/** Number of items currently due (fast count for badges/cards). */
export async function getSmartReviewCount(): Promise<number> {
  try {
    const q = await getSmartReviewQueue();
    return q.length;
  } catch {
    return 0;
  }
}

/**
 * Records the outcome of reviewing one item during a Smart Review session.
 * Correct → advance interval (and remove from wrong bank when mastered past the
 * longest interval). Wrong → reset to day 1.
 */
export async function recordReview(id: string, correct: boolean): Promise<void> {
  try {
    const map = await readSchedule();
    const entry = map[id] || { id, reps: 0, nextReviewAt: todayStr() };
    const now = new Date().toISOString();
    if (correct) {
      const reps = entry.reps + 1;
      const intervalDays = REVIEW_INTERVALS_DAYS[Math.min(reps - 1, REVIEW_INTERVALS_DAYS.length - 1)];
      const due = new Date();
      due.setDate(due.getDate() + (reps >= REVIEW_INTERVALS_DAYS.length ? 30 : intervalDays));
      map[id] = { id, reps, nextReviewAt: due.toISOString().slice(0, 10), lastReviewedAt: now };
      // Mastered past the longest interval → graduate out of the weak bank.
      if (reps >= REVIEW_INTERVALS_DAYS.length + 1) {
        delete map[id];
        void removeWrongAnswer(id);
      }
    } else {
      map[id] = { id, reps: 0, nextReviewAt: todayStr(), lastReviewedAt: now };
    }
    await writeSchedule(map);
  } catch {
    /* ignore */
  }
}

/** Marks an item as reviewed without changing the schedule (for removal paths). */
export async function clearSchedule(id: string): Promise<void> {
  try {
    const map = await readSchedule();
    if (map[id]) {
      delete map[id];
      await writeSchedule(map);
    }
  } catch {
    /* ignore */
  }
}