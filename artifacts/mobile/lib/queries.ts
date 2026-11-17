import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../src/lib/supabase';
import type { Question, MockResult, Bookmark } from '../src/types';

const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
};

export async function fetchUnseenQuestions(
  totalCount: number,
  examType: string,
  category?: string,
  subcategory?: string
): Promise<Question[]> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const rpcName = examType === 'mock' ? 'fetch_unseen_questions_distributed' : 'fetch_unseen_questions';
  
  const { data, error } = await supabase.rpc(rpcName, {
    p_total_count: totalCount,
    p_category: category,
    p_subcategory: subcategory,
    p_exam_type: examType,
  });

  if (error) throw error;

  if (Array.isArray(data)) {
    return data as Question[];
  } else if (data && typeof data === 'object' && 'questions' in data) {
    return (data as any).questions as Question[];
  }
  
  return [];
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, question:questions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Bookmark[]) || [];
}

export async function toggleBookmark(userId: string, questionId: string, isCurrentlyBookmarked: boolean): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  if (isCurrentlyBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('bookmarks')
      .upsert({ user_id: userId, question_id: questionId }, { onConflict: 'user_id,question_id' });
    if (error) throw error;
  }
}

export async function saveExamResultToSupabase(result: any, userId: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase.from('results').insert({
    ...result,
    user_id: userId,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export function useSubcategoryQuestions(subcategory: string, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'sub', userId, subcategory],
    queryFn: () => fetchUnseenQuestions(50, 'subject', undefined, subcategory),
    enabled: !!subcategory && !!userId,
  });
}

export function useCategoryQuestions(category: string, count: number, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'cat', userId, category, count],
    queryFn: () => fetchUnseenQuestions(count, 'subject', category, undefined),
    enabled: !!category && !!userId,
  });
}

export function useMockQuestions(userId?: string) {
  return useQuery({
    queryKey: ['questions', 'mock', userId],
    queryFn: () => fetchUnseenQuestions(100, 'mock'),
    enabled: !!userId,
  });
}

export function useDailyQuestions(count: number = 20, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'daily', userId, count],
    queryFn: () => fetchUnseenQuestions(count, 'daily'),
    enabled: !!userId,
  });
}

export function useChallengeQuestions(userId?: string) {
  return useQuery({
    queryKey: ['questions', 'challenge', userId],
    queryFn: () => fetchUnseenQuestions(20, 'challenge'),
    enabled: !!userId,
  });
}

export function useBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => fetchBookmarks(userId!),
    enabled: !!userId,
  });
}

export function useMockResults(userId?: string) {
  return useQuery({
    queryKey: ['results', userId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [] as MockResult[];
      const supabase = getSupabaseClient();
      if (!supabase) return [] as MockResult[];
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as MockResult[]) || [];
    },
    enabled: !!userId,
  });
}

export { getSupabaseClient };
