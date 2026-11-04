import { MockResult, Bookmark } from '@/src/types';

import { getSupabaseClient } from './supabase';
import type { Question, ExamType } from '@/src/types';

/**
 * Atomic delivery using PostgreSQL RPC.
 * This function calls the `fetch_unseen_questions_distributed` RPC.
 * All question fetching and exposure recording happens atomically in a single transaction.
 */

/**
 * Validate RPC Response Structure
 */
function validateRPCResponse(data: any) {
  if (typeof data !== 'object' || data === null) throw new Error('Invalid RPC response: Expected object');
  if (!Array.isArray(data.questions)) throw new Error('Invalid RPC response: Expected questions array');
  if (typeof data.status !== 'string' || !['complete', 'partial', 'insufficient'].includes(data.status)) throw new Error('Invalid RPC response: Invalid status');
  if (typeof data.requested_count !== 'number' || typeof data.delivered_count !== 'number') throw new Error('Invalid RPC response: Invalid counts');
  if (data.delivered_count !== data.questions.length) throw new Error('Invalid RPC response: delivered_count mismatch');
}

export async function fetchQuestionPool(
  filters: { category?: string; subcategory?: string },
  count: number,
  examType: ExamType
): Promise<Question[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data, error } = await supabase.rpc('fetch_unseen_questions_distributed', {
    p_total_count: count,
    p_category: filters.category || null,
    p_subcategory: filters.subcategory || null,
    p_exam_type: examType
  });

  if (error) {
    throw new Error(`Failed to fetch questions via RPC: ${error.message}`);
  }

  validateRPCResponse(data);
  const response = data as {
    status: 'complete' | 'partial' | 'insufficient';
    requested_count: number;
    delivered_count: number;
    category_stats: Record<string, { requested: number; delivered: number }>;
    questions: Question[];
  };

  if (response.status === 'insufficient') {
    console.warn('No unseen questions available for the requested criteria.');
  } else if (response.status === 'partial') {
    console.warn(`Only ${response.delivered_count}/${response.requested_count} questions delivered.`);
  }

  return response.questions ?? [];
}

/**
 * Get category statistics (total, seen, unseen questions).
 * Used for progress tracking and UI displays.
 * Note: This is a lightweight function that doesn't require exposure recording.
 */
export async function fetchCategoryQuestionStats(): Promise<Record<string, { total: number; seen: number; unseen: number }>> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');

  const stats: Record<string, { total: number; seen: number; unseen: number }> = {};

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, category')
    .eq('active', true);

  if (error) throw new Error(`Failed to fetch category stats: ${error.message}`);
  
  // Get current user's exposed question IDs for tracking
  const { data: exposedData, error: exposedError } = await supabase
    .from('question_exposures')
    .select('question_id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
  
  if (exposedError) throw new Error(`Failed to fetch exposure data: ${exposedError.message}`);
  const seenIds = new Set(exposedData?.map(e => e.question_id) || []);
  
  for (const q of (questions ?? [])) {
    const category = q.category || 'Unknown';
    if (!stats[category]) stats[category] = { total: 0, seen: 0, unseen: 0 };
    stats[category].total += 1;
    if (seenIds.has(q.id)) {
      stats[category].seen += 1;
    } else {
      stats[category].unseen += 1;
    }
  }

  return stats;
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  return await fetchQuestionPool({ category }, count, 'practice');
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data, error } = await supabase.rpc('fetch_unseen_questions_distributed', {
    p_total_count: limit,
    p_subcategory: subcategory,
    p_page: page,
    p_exam_type: 'practice'
  });

  if (error) throw new Error(`Failed to fetch questions via RPC: ${error.message}`);
  
  validateRPCResponse(data);
  const response = data as { questions: Question[] };
  return response.questions ?? [];
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  // Map count to valid exam type
  let examType: ExamType;
  if (count === 20) examType = 'daily_20';
  else if (count === 50) examType = 'daily_50';
  else if (count === 100) examType = 'daily_100';
  else examType = 'daily_20'; // default fallback

  return await fetchQuestionPool({}, count, examType);
}

export async function searchQuestions(query: string): Promise<Question[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('question', `%${query}%`)
    .eq('active', true)
    .limit(50);
    
  if (error) throw new Error(`Failed to search questions: ${error.message}`);
  return data ?? [];
}

export async function fetchResults(userId: string): Promise<MockResult[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');
  
  const { data, error } = await supabase
    .from('mock_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) throw new Error(`Failed to fetch results: ${error.message}`);
  return data ?? [];
}

export async function saveResult(payload: {
  user_id: string; score: number; correct: number; wrong: number;
  skipped: number; percentage: number; time_taken: number; exam_type: ExamType;
}): Promise<MockResult> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');
  
  const { data, error } = await supabase
    .from('mock_results')
    .insert(payload)
    .select()
    .single();
    
  if (error) throw new Error(`Failed to save result: ${error.message}`);
  return data;
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');
  
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, question:questions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(`Failed to fetch bookmarks: ${error.message}`);
  return data ?? [];
}

export async function toggleBookmark(userId: string, questionId: string, isBookmarked: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized.');
  
  let error;
  if (isBookmarked) {
    ({ error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', questionId));
  } else {
    ({ error } = await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId }));
  }
  
  if (error) throw new Error(`Failed to toggle bookmark: ${error.message}`);
}

export async function clearQuestionHistory(): Promise<void> {
  // Destructive history reset functionality removed per requirements.
  console.warn('Destructive clearQuestionHistory functionality is disabled in online-only mode.');
}
