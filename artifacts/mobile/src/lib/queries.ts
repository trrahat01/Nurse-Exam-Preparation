import { supabase, isSupabaseConfigured } from './supabase';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType } from '@/src/types';
import { getSeenQuestionIds, filterUnseenQuestions, markQuestionsSeen, clearSeenQuestions } from './seenQuestions';

const shuffle = (arr: Question[]) => arr.sort(() => Math.random() - 0.5);
const PAGE_SIZE = 1000;

type QuestionStats = { total: number; seen: number; unseen: number };

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function getServerSeenQuestionIds(userId: string): Promise<Set<string>> {
  const seen = new Set<string>();
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('question_exposures')
      .select('question_id')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;

    for (const row of data) {
      if (row.question_id) seen.add(row.question_id);
    }

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return seen;
}

async function getMergedSeenQuestionIds(): Promise<Set<string>> {
  const localSeen = await getSeenQuestionIds();
  const userId = await getCurrentUserId();
  if (!userId) return localSeen;

  const serverSeen = await getServerSeenQuestionIds(userId);
  return new Set([...localSeen, ...serverSeen]);
}

async function fetchAllActiveQuestionRows(): Promise<Pick<Question, 'id' | 'category'>[]> {
  const rows: Pick<Question, 'id' | 'category'>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, category')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;

    rows.push(...(data as Pick<Question, 'id' | 'category'>[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function fetchQuestionPool(filters: { category?: string; subcategory?: string }, count: number, markSeen = true): Promise<Question[]> {
  const seenIds = await getMergedSeenQuestionIds();
  const unseenCandidates: Question[] = [];
  const seenCandidates: Question[] = [];
  let from = 0;

  while (true) {
    let query = supabase.from('questions').select('*').eq('active', true);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);

    const { data, error } = await query.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;

    const batch = data as Question[];
    const unseen = filterUnseenQuestions(batch, seenIds);
    unseenCandidates.push(...unseen);
    seenCandidates.push(...batch);

    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  for (const question of shuffle(unseenCandidates)) {
    if (selected.length >= count) break;
    if (!selectedIds.has(question.id)) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  if (selected.length < count) {
    for (const question of shuffle(seenCandidates)) {
      if (selected.length >= count) break;
      if (!selectedIds.has(question.id)) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
  }

  const finalQuestions = shuffle(selected).slice(0, count);
  if (markSeen) {
    await markQuestionsSeen(finalQuestions.map(q => q.id));
  }
  return finalQuestions;
}

export async function fetchCategories(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch { return []; }
}

/**
 * Get question counts per category from the database
 */
export async function fetchCategoryQuestionCounts(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const stats = await fetchCategoryQuestionStats();
    const counts: Record<string, number> = {};
    for (const [category, value] of Object.entries(stats)) {
      counts[category] = value.total;
    }
    return counts;
  } catch { return {}; }
}

export async function fetchCategoryQuestionStats(): Promise<Record<string, QuestionStats>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const rows = await fetchAllActiveQuestionRows();
    const seenIds = await getMergedSeenQuestionIds();
    const stats: Record<string, QuestionStats> = {};

    for (const row of rows) {
      const category = row.category || 'Unknown';
      if (!stats[category]) stats[category] = { total: 0, seen: 0, unseen: 0 };
      stats[category].total += 1;
      if (seenIds.has(row.id)) stats[category].seen += 1;
      else stats[category].unseen += 1;
    }

    return stats;
  } catch {
    return {};
  }
}

/**
 * Get total question count from the database
 */
export async function fetchTotalQuestionCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    if (error) return 0;
    return count || 0;
  } catch { return 0; }
}

export async function fetchMockQuestions(): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const DIST: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
    let selected: Question[] = [];
    for (const [category, count] of Object.entries(DIST)) {
      const catQuestions = await fetchQuestionPool({ category }, count);
      selected.push(...catQuestions);
    }

    if (selected.length < 100) {
      const fallback = await fetchQuestionPool({}, 100 - selected.length, false);
      const used = new Set(selected.map(q => q.id));
      selected.push(...fallback.filter(q => !used.has(q.id)));
    }

    const finalQuestions = shuffle(selected).slice(0, 100);
    await markQuestionsSeen(finalQuestions.map(q => q.id));
    return finalQuestions;
  } catch (e) { console.warn('fetchMockQuestions failed:', e); return []; }
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    return await fetchQuestionPool({}, count);
  } catch { return []; }
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const pool = await fetchQuestionPool({ subcategory }, limit * (page + 1));
    const from = page * limit;
    return pool.slice(from, from + limit);
  } catch { return []; }
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    return await fetchQuestionPool({ category }, count);
  } catch { return []; }
}

export async function searchQuestions(query: string): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('questions').select('*').ilike('question', `%${query}%`).eq('active', true).limit(50);
    if (error) return [];
    return data ?? [];
  } catch { return []; }
}

export async function fetchResults(userId: string): Promise<MockResult[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('mock_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (error) return [];
    return data ?? [];
  } catch { return []; }
}

export async function saveResult(payload: {
  user_id: string; score: number; correct: number; wrong: number;
  skipped: number; percentage: number; time_taken: number; exam_type: ExamType;
}): Promise<MockResult | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('mock_results').insert(payload).select().single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('bookmarks').select('*, question:questions(*)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch { return []; }
}

export async function toggleBookmark(userId: string, questionId: string, isBookmarked: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    if (isBookmarked) await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', questionId);
    else await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId });
  } catch {}
}

export async function clearQuestionHistory(): Promise<void> {
  try {
    await clearSeenQuestions();
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from('question_exposures').delete().eq('user_id', userId);
  } catch {}
}
