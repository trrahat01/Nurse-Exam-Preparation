import { getSeenQuestionIds, filterUnseenQuestions, markQuestionsSeen, clearSeenQuestions } from './seenQuestions';
import { supabase } from './supabase';
import type { Question, MockResult, Bookmark, ExamType, Category } from '@/src/types';
import { CATEGORY_CONFIG } from '@/src/types';

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
type QuestionStats = { total: number; seen: number; unseen: number };

/** A question is only useful if it has real content; blank rows never reach the exam. */
function isUsableQuestion(q: Question | null | undefined): q is Question {
  if (!q) return false;
  return !!(
    String(q.question || '').trim() &&
    (String(q.option_a || '').trim() ||
      String(q.option_b || '').trim() ||
      String(q.option_c || '').trim() ||
      String(q.option_d || '').trim()) &&
    /^[a-d]$/.test(String(q.correct_answer || ''))
  );
}

/** Map a Supabase `questions` row to the app Question shape. */
export function mapRow(r: any): Question {
  return {
    id: String(r.id),
    category: r.category || 'General Knowledge',
    subcategory: r.subcategory || '',
    exam_type: r.exam_type || 'bpsc',
    subject: r.subject || '',
    chapter: r.chapter || '',
    question: r.question || '',
    option_a: r.option_a || '',
    option_b: r.option_b || '',
    option_c: r.option_c || '',
    option_d: r.option_d || '',
    correct_answer: /^[a-d]$/.test(String(r.correct_answer)) ? r.correct_answer : 'a',
    explanation: r.explanation || '',
    memory_tip: r.memory_tip || '',
    solution_step: r.solution_step || '',
    formula: r.formula || '',
    difficulty: ['easy', 'medium', 'hard'].includes(r.difficulty) ? r.difficulty : 'medium',
    importance: Number(r.importance) || 3,
    tags: Array.isArray(r.tags) ? r.tags : [],
    language: (['english', 'bangla', 'mixed'].includes(r.language) ? r.language : 'english') as any,
    verified: r.verified !== false,
    active: r.active !== false,
  };
}

async function fetchQuestions(filters: { category?: string; subcategory?: string }, limit: number): Promise<Question[]> {
  if (!supabase) return [];
  try {
    let q = supabase.from('questions').select('*').limit(Math.min(Math.max(limit, 1), 200));
    if (filters.category) q = q.eq('category', filters.category);
    if (filters.subcategory) q = q.eq('subcategory', filters.subcategory);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(mapRow).filter(isUsableQuestion);
  } catch {
    return [];
  }
}

export async function fetchCategoryQuestionStats(): Promise<Record<string, QuestionStats>> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('questions').select('category');
      if (!error && data) {
        const counts: Record<string, number> = {};
        for (const r of data) { const c = r.category || 'Unknown'; counts[c] = (counts[c] || 0) + 1; }
        const stats: Record<string, QuestionStats> = {};
        for (const [cat, total] of Object.entries(counts)) stats[cat] = { total: total, seen: 0, unseen: total };
        return stats;
      }
    } catch { /* ignore */ }
  }
  return {};
}

export async function fetchTotalQuestionCount(): Promise<number> {
  if (supabase) {
    try {
      const { count, error } = await supabase.from('questions').select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number' && count > 0) return count;
    } catch { /* ignore */ }
  }
  return 0;
}

export async function fetchMockQuestions(): Promise<Question[]> {
  const DIST: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
  let selected: Question[] = [];
  const seenIds = await getSeenQuestionIds();
  for (const [category, count] of Object.entries(DIST)) {
    const pool = await fetchQuestions({ category }, count * 2);
    const unseen = filterUnseenQuestions(pool, seenIds);
    selected.push(...shuffle(unseen).slice(0, count));
  }
  if (selected.length < 100) {
    const fallback = await fetchQuestions({}, 100 - selected.length);
    selected.push(...fallback.filter(q => !selected.some(s => s.id === q.id)));
  }
  const finalQuestions = shuffle(selected).slice(0, 100);
  if (finalQuestions.length > 0) await markQuestionsSeen(finalQuestions.map(q => q.id));
  return finalQuestions;
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  const pool = await fetchQuestions({}, count * 2);
  const seenIds = await getSeenQuestionIds();
  const unseen = filterUnseenQuestions(pool, seenIds);
  const result = shuffle(unseen).slice(0, count);
  if (result.length > 0) await markQuestionsSeen(result.map(q => q.id));
  return result;
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  return (await fetchQuestions({ category }, count)).slice(0, count);
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  const pool = await fetchQuestions({ subcategory }, ((page + 1) * limit));
  return pool.slice(page * limit, (page + 1) * limit);
}

export async function searchQuestions(query: string): Promise<Question[]> {
  if (!supabase) return [];
  const q = query.trim();
  if (!q) return [];
  try {
    const { data, error } = await supabase.from('questions').select('*').ilike('question', `%${q}%`).limit(50);
    if (error || !data) return [];
    return data.map(mapRow).filter(isUsableQuestion);
  } catch {
    return [];
  }
}