import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_QUESTIONS_KEY = 'seen_question_ids';
const MAX_SEEN = 5000; // Keep last 5000 seen IDs to prevent storage bloat

/**
 * Get the set of question IDs the user has already seen
 */
export async function getSeenQuestionIds(): Promise<Set<string>> {
  try {
    const data = await AsyncStorage.getItem(SEEN_QUESTIONS_KEY);
    if (!data) return new Set();
    const arr = JSON.parse(data) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/**
 * Mark question IDs as seen by the user
 */
export async function markQuestionsSeen(ids: string[]): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(SEEN_QUESTIONS_KEY);
    let arr: string[] = data ? JSON.parse(data) : [];
    
    // Add new IDs
    const existing = new Set(arr);
    for (const id of ids) {
      if (!existing.has(id)) {
        arr.push(id);
        existing.add(id);
      }
    }
    
    // Keep only the most recent MAX_SEEN
    if (arr.length > MAX_SEEN) {
      arr = arr.slice(arr.length - MAX_SEEN);
    }
    
    await AsyncStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Failed to mark questions seen:', e);
  }
}

/**
 * Filter out questions the user has already seen
 */
export function filterUnseenQuestions<T extends { id: string }>(
  questions: T[],
  seenIds: Set<string>
): T[] {
  return questions.filter(q => !seenIds.has(q.id));
}

/**
 * Clear all seen question history (for reset)
 */
export async function clearSeenQuestions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEEN_QUESTIONS_KEY);
  } catch (e) {
    console.error('Failed to clear seen questions:', e);
  }
}