import { supabase, isSupabaseConfigured } from './supabase';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType } from '@/src/types';

const shuffle = (arr: Question[]) => arr.sort(() => Math.random() - 0.5);

export async function fetchCategories(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch { return []; }
}

export async function fetchMockQuestions(): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    // Get all active questions and split by category
    const { data, error } = await supabase.from('questions').select('*').eq('active', true).limit(200);
    if (error || !data) return [];
    
    const questions = data as Question[];
    const DIST: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
    const byCategory: Record<string, Question[]> = {};
    
    questions.forEach(q => {
      if (!byCategory[q.category]) byCategory[q.category] = [];
      byCategory[q.category].push(q);
    });
    
    let selected: Question[] = [];
    Object.entries(DIST).forEach(([cat, count]) => {
      const catQ = byCategory[cat] || [];
      selected.push(...shuffle(catQ).slice(0, count));
    });
    
    // If still < 100, fill with random
    if (selected.length < 100) {
      const used = new Set(selected.map(q => q.id));
      const extras = shuffle(questions).filter(q => !used.has(q.id));
      selected.push(...extras.slice(0, 100 - selected.length));
    }
    
    return shuffle(selected).slice(0, 100);
  } catch (e) { console.warn('fetchMockQuestions failed:', e); return []; }
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('questions').select('*').eq('active', true).limit(count * 4);
    if (error || !data) return [];
    return shuffle(data as Question[]).slice(0, count);
  } catch { return []; }
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subcategory', subcategory)
      .eq('active', true)
      .range(from, to);
    if (error || !data) return [];
    return shuffle(data as Question[]);
  } catch { return []; }
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from('questions').select('*').eq('category', category).eq('active', true).limit(count * 3);
    if (error || !data) return [];
    return shuffle(data as Question[]).slice(0, count);
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
