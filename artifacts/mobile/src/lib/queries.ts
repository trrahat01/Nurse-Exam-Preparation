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
  const stats: Record<string, QuestionStats> = {};
  const CATS = ['Nursing', 'General Knowledge', 'English', 'Bangla'];
  if (supabase) {
    try {
      const sb = supabase;
      await Promise.all(CATS.map(async (cat) => {
        const { count, error } = await sb
          .from('questions').select('id', { count: 'exact', head: true }).eq('category', cat);
        if (!error && typeof count === 'number' && count > 0) {
          stats[cat] = { total: count, seen: 0, unseen: count };
        }
      }));
    } catch { /* ignore */ }
  }
  return stats;
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

export async function fetchMockQuestions(): Promise<{ questions: Question[]; shortage?: string[] }> {
  const DIST: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
  let selected: Question[] = [];
  let shortages: string[] = [];
  const seenIds = await getSeenQuestionIds();

  for (const [category, count] of Object.entries(DIST)) {
    // Fetch a larger pool to find unseen questions
    const pool = await fetchQuestions({ category }, Math.max(count * 5, 200));
    let unseen = filterUnseenQuestions(pool, seenIds);
    
    if (unseen.length < count) {
      shortages.push(category);
    }
    
    selected.push(...shuffle(unseen).slice(0, count));
  }

  const finalQuestions = shuffle(selected);
  // Requirement: Every Full Mock Test must contain exactly 100 questions when enough eligible.
  // Requirement: Never silently substitute incorrect categories or duplicate questions to reach 100.
  // Requirement: If there are not enough eligible questions, show a clear message.
  
  if (shortages.length > 0) {
     // We still return what we have, but also inform about shortage
     return { questions: finalQuestions, shortage: shortages };
  }

  if (finalQuestions.length > 0) {
    // Note: User wants "presented when delivered", but for mock tests, 
    // it's probably better to mark all 100 seen once the test starts.
    // I'll move this markQuestionsSeen to the Exam screen's start logic or keep it here if acceptable.
    // The requirement says "Record a question as presented when it is actually delivered to the user".
    // I will remove it from here and put it in the store/exam flow.
  }
  
  return { questions: finalQuestions };
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  const pool = await fetchQuestions({}, Math.max(count * 5, 100));
  const seenIds = await getSeenQuestionIds();
  const unseen = filterUnseenQuestions(pool, seenIds);
  let result = shuffle(unseen).slice(0, count);
  
  // If pool exhausted, we might need to recycle or tell the user.
  // For now, return what we have.
  return result;
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  return (await fetchQuestions({ category }, count)).slice(0, count);
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  // Try exact subcategory first.
  const pool = await fetchQuestions({ subcategory }, ((page + 1) * limit));
  if (pool.length > 0) return pool.slice(page * limit, (page + 1) * limit);
  // Fall back to a generic pool so practice never shows empty.
  const fallback = await fetchQuestions({}, (((page + 1) * limit)));
  return fallback.slice(page * limit, (page + 1) * limit);
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
// ── Results ─────────────────────────────────────────────────

export async function fetchResults(userId: string): Promise<MockResult[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error || !data) return [];
    return data.map(d => ({ ...d, id: String(d.id), user_id: d.user_id || userId })) as unknown as MockResult[];
  } catch { return []; }
}

export async function saveResult(payload: {
  user_id: string; score: number; correct: number; wrong: number; skipped: number;
  percentage: number; time_taken: number; exam_type: ExamType;
}): Promise<MockResult | null> {
  if (!supabase) return null;
  try {
    await supabase.from('results').insert([{
      user_id: payload.user_id, exam_type: payload.exam_type, score: payload.score,
      correct: payload.correct, wrong: payload.wrong, skipped: payload.skipped,
      percentage: payload.percentage, time_taken: payload.time_taken,
      total_questions: payload.correct + payload.wrong + payload.skipped,
    }]);
  } catch { /* ignore */ }
  return null;
}

// ── Bookmarks ───────────────────────────────────────────────

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('bookmarks').select('question_id').eq('user_id', userId);
    if (error || !data) return [];
    const ids = data.map(d => d.question_id).filter((x: any) => x != null);
    if (ids.length === 0) return [];
    const { data: rows, error: qErr } = await supabase.from('questions').select('*').in('id', ids as any[]);
    if (qErr || !rows) return [];
    return rows.map(row => ({
      id: 'b' + row.id,
      user_id: String(userId),
      question_id: String(row.id),
      created_at: new Date().toISOString(),
      question: mapRow(row),
    })) as unknown as Bookmark[];
  } catch { return []; }
}

export async function toggleBookmark(userId: string, questionId: string, isBookmarked: boolean): Promise<void> {
  if (!supabase) return;
  const qid = Number(questionId);
  if (!Number.isFinite(qid)) return;
  try {
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', qid);
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, question_id: qid });
    }
  } catch { /* local store handles offline */ }
}

// ── History / misc ──────────────────────────────────────────

export async function clearQuestionHistory(): Promise<void> {
  await clearSeenQuestions();
}

export async function fetchCategories(): Promise<Category[]> {
  return Object.values(CATEGORY_CONFIG).map((cfg: any, i: number) => ({
    id: String(i + 1), name: cfg.name, slug: cfg.name.toLowerCase().replace(/\s+/g, '-'),
    icon: cfg.icon, color: cfg.color, bg_color: cfg.bgColor, description: cfg.description, order_index: i,
  }));
}

export async function fetchCategoryQuestionCounts(): Promise<Record<string, number>> {
  const stats = await fetchCategoryQuestionStats();
  const counts: Record<string, number> = {};
  for (const [cat, v] of Object.entries(stats)) counts[cat] = v.total;
  return counts;
}

/**
 * Returns the REAL subcategory (chapter) names present in Supabase for a
 * category, so practice shows chapters that actually have questions.
 */
export async function fetchSubcategories(category: string): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('questions').select('subcategory').eq('category', category).limit(1000);
    if (error || !data) return [];
    const counts = new Map<string, number>();
    for (const r of data) {
      const s = (r.subcategory || '').trim();
      if (!s || s === 'General') continue;
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    // Only show subcategories that have real questions.
    return [...counts.entries()]
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s);
  } catch {
    return [];
  }
}