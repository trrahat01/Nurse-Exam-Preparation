import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../src/lib/supabase';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType } from '../src/types';
import { MOCK_DISTRIBUTION } from '../src/types';
import { fetchMockQuestions as fetchMockQuestionsFromHelper, fetchCategoryQuestions as fetchCategoryQuestionsFromHelper, fetchDailyQuestions as fetchDailyQuestionsFromHelper, fetchQuestionPool, fetchCategoryQuestionStats } from '../src/lib/queries';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
};

// ─── Questions ────────────────────────────────────────────────────────────────

export function useSubcategoryQuestions(subcategory: string, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'sub', userId, subcategory],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Online-only mode requires a valid Supabase configuration.');
      }
      // Use the RPC helper for exam delivery
      return await fetchQuestionPool({ subcategory }, 20, 'practice');
    },
    enabled: !!subcategory && !!userId,
    staleTime: 0, // Force fresh request for each practice attempt to prevent repeats
  });
}

export function useCategoryQuestions(category: string, count: number, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'cat', userId, category, count],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Online-only mode requires a valid Supabase configuration.');
      }
      return fetchCategoryQuestionsFromHelper(category, count);
    },
    enabled: !!category && !!userId,
    staleTime: 0, // Force fresh request for each practice attempt to prevent repeats
  });
}

export function useMockQuestions() {
  return useQuery({
    queryKey: ['mock-questions'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Online-only mode requires a valid Supabase configuration.');
      }
      
      return fetchMockQuestionsFromHelper();
    },
    enabled: false,
    staleTime: 0,
  });
}

export function useDailyQuestions(count: number) {
  return useQuery({
    queryKey: ['daily', count],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Online-only mode requires a valid Supabase configuration.');
      }
      return fetchDailyQuestionsFromHelper(count);
    },
    enabled: false,
    staleTime: 0,
  });
}

// ─── Results ──────────────────────────────────────────────────────────────────

export function useMockResults(userId: string | undefined) {
  return useQuery({
    queryKey: ['results', userId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return [] as MockResult[];
      }
      const supabase = getSupabaseClient();
      if (!supabase) return [] as MockResult[];
      const { data, error } = await supabase
        .from('mock_results')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      if (!data || data.length === 0) {
        return [] as MockResult[];
      }
      return data as MockResult[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSaveResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      user_id: string;
      score: number;
      correct: number;
      wrong: number;
      skipped: number;
      percentage: number;
      time_taken: number;
      exam_type: ExamType;
    }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized.');
      const { data, error } = await supabase
        .from('mock_results')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as MockResult;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['results', vars.user_id] });
    },
  });
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function useBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return [] as Bookmark[];
      }
      const supabase = getSupabaseClient();
      if (!supabase) return [] as Bookmark[];
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, question:questions(*)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data) return [] as Bookmark[];
      return data as Bookmark[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useIsBookmarked(userId: string | undefined, questionId: string) {
  return useQuery({
    queryKey: ['bookmark-check', userId, questionId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return false;
      }
      const supabase = getSupabaseClient();
      if (!supabase) return false;
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId!)
        .eq('question_id', questionId)
        .single();
      return !!data;
    },
    enabled: !!userId && !!questionId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      questionId,
      isBookmarked,
    }: {
      userId: string;
      questionId: string;
      isBookmarked: boolean;
    }) => {
      if (!isSupabaseConfigured()) {
        // Silently succeed in mock mode
        return;
      }
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized.');
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: userId, question_id: questionId });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['bookmarks', vars.userId] });
      qc.invalidateQueries({ queryKey: ['bookmark-check', vars.userId, vars.questionId] });
    },
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearchQuestions(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Online-only mode requires a valid Supabase configuration.');
      }
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized.');
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .ilike('question', `%${query}%`)
        .eq('active', true)
        .limit(50);
      if (error) throw error;
      if (!data || data.length === 0) {
        return [] as Question[];
      }
      return data as Question[];
    },
    enabled: query.trim().length > 2,
    staleTime: 1000 * 30,
  });
}

export { fetchCategoryQuestionStats };

