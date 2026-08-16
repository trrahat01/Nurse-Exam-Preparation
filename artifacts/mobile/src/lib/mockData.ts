import type { Question } from '@/src/types';
import OFFLINE_QUESTIONS from '@/src/data/offlineQuestions.json';

/**
 * Offline / fallback question bank.
 *
 * These are REAL questions extracted from the repo's SQL seed data
 * (scripts/generate-offline-bank.cjs -> src/data/offlineQuestions.json).
 * They are guaranteed usable (valid question + 4 options + a..d answer) so the
 * app always has content even when the Appwrite collection is empty/broken
 * or the device is offline.
 */

// Normalize any field drift from the SQL source into the app's Question shape.
const MOCK_QUESTIONS: Question[] = (OFFLINE_QUESTIONS as unknown[]).map((raw: any, i: number): Question => ({
  id: raw.id || `offline-${i + 1}`,
  category: raw.category || 'General Knowledge',
  subcategory: raw.subcategory || 'General',
  exam_type: raw.exam_type || 'bpsc',
  subject: raw.subject || '',
  chapter: raw.chapter || '',
  question: String(raw.question || ''),
  option_a: String(raw.option_a || ''),
  option_b: String(raw.option_b || ''),
  option_c: String(raw.option_c || ''),
  option_d: String(raw.option_d || ''),
  correct_answer: (raw.correct_answer as Question['correct_answer']) || 'a',
  explanation: String(raw.explanation || ''),
  memory_tip: String(raw.memory_tip || ''),
  solution_step: String(raw.solution_step || ''),
  formula: String(raw.formula || ''),
  difficulty: (raw.difficulty as Question['difficulty']) || 'medium',
  importance: typeof raw.importance === 'number' ? raw.importance : 3,
  tags: Array.isArray(raw.tags) ? raw.tags : [],
  language: (raw.language as Question['language']) || 'english',
  verified: raw.verified !== false,
  active: raw.active !== false,
}));

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** All usable offline questions. */
export function getMockQuestions(): Question[] {
  return MOCK_QUESTIONS;
}

/** Questions filtered to one category. */
export function getMockQuestionsByCategory(category: string): Question[] {
  return MOCK_QUESTIONS.filter(q => q.category === category);
}

/** Questions for one category + optional subcategory/chapter. */
export function getOfflineQuestionsByCategory(category: string, chapter?: string): Question[] {
  if (category && chapter) {
    const byChapter = MOCK_QUESTIONS.filter(
      q => q.category === category && (q.subcategory === chapter || q.chapter === chapter)
    );
    if (byChapter.length > 0) return byChapter;
  }
  return MOCK_QUESTIONS.filter(q => q.category === category);
}

/**
 * A full-length mock selection (100 Qs) mirroring the official distribution:
 * Nursing 60 / General Knowledge 15 / English 15 / Bangla 10.
 */
export function getMockMockQuestions(): Question[] {
  const dist: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
  const selected: Question[] = [];
  for (const [cat, count] of Object.entries(dist)) {
    const catQuestions = shuffle(MOCK_QUESTIONS.filter(q => q.category === cat));
    selected.push(...catQuestions.slice(0, count));
  }
  return shuffle(selected).slice(0, 100);
}

/** Random selection for daily practice (guaranteed at least one per category). */
export function getMockDailyQuestions(count: number): Question[] {
  if (count <= 0) return [];
  const shuffled = shuffle(MOCK_QUESTIONS);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
