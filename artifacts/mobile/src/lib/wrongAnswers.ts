import AsyncStorage from '@react-native-async-storage/async-storage';

const WRONG_KEY = 'wrong_answers';
// Store full question payloads (with id + category + explanation) so we can
// re-quiz without re-fetching.
const MAX_WRONG = 200;

export interface WrongItem {
  id: string;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  wrong_count: number;
  last_wrong_at: string;
}

export async function getWrongAnswers(): Promise<WrongItem[]> {
  try {
    const d = await AsyncStorage.getItem(WRONG_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

/** Record a question as wrong. Adds or updates the wrong_count. */
export async function addWrongAnswer(q: {
  id: string; category?: string; question: string;
  option_a?: string; option_b?: string; option_c?: string; option_d?: string;
  correct_answer?: string; explanation?: string;
}): Promise<void> {
  try {
    const list = await getWrongAnswers();
    const idx = list.findIndex(x => x.id === q.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      list[idx].wrong_count += 1;
      list[idx].last_wrong_at = now;
    } else {
      list.push({
        id: q.id,
        category: q.category || 'General',
        question: q.question,
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_answer: q.correct_answer || 'a',
        explanation: q.explanation || '',
        wrong_count: 1,
        last_wrong_at: now,
      });
    }
    await AsyncStorage.setItem(WRONG_KEY, JSON.stringify(list.slice(0, MAX_WRONG)));
  } catch { /* ignore */ }
}

/** Remove a question from the wrong bank (mastered). */
export async function removeWrongAnswer(id: string): Promise<void> {
  try {
    const list = await getWrongAnswers();
    await AsyncStorage.setItem(WRONG_KEY, JSON.stringify(list.filter(x => x.id !== id)));
  } catch { /* ignore */ }
}

export async function clearWrongAnswers(): Promise<void> {
  try { await AsyncStorage.removeItem(WRONG_KEY); } catch { /* ignore */ }
}