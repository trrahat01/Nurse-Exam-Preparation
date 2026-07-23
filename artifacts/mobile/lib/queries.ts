import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType } from './types';
import { MOCK_DISTRIBUTION } from './types';

// ─── Questions ────────────────────────────────────────────────────────────────

export function useSubcategoryQuestions(subcategory: string) {
  return useQuery({
    queryKey: ['questions', 'sub', subcategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory', subcategory)
        .eq('active', true)
        .limit(100);
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!subcategory,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategoryQuestions(category: string, count: number) {
  return useQuery({
    queryKey: ['questions', 'cat', category, count],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .limit(count * 3);
      if (error) throw error;
      const arr = (data as Question[]).sort(() => Math.random() - 0.5);
      return arr.slice(0, count);
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMockQuestions() {
  return useQuery({
    queryKey: ['mock-questions'],
    queryFn: async () => {
      const shuffle = (arr: Question[]) => arr.sort(() => Math.random() - 0.5);
      const fetches = Object.entries(MOCK_DISTRIBUTION).map(([cat, count]) =>
        supabase
          .from('questions')
          .select('*')
          .eq('category', cat)
          .eq('active', true)
          .limit(count * 3)
          .then(({ data, error }) => {
            if (error) throw error;
            return shuffle(data as Question[]).slice(0, count);
          })
      );
      const results = await Promise.all(fetches);
      return shuffle(results.flat());
    },
    enabled: false,
    staleTime: 0,
  });
}

export function useDailyQuestions(count: number) {
  return useQuery({
    queryKey: ['daily', count],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('active', true)
        .limit(count * 4);
      if (error) throw error;
      return (data as Question[]).sort(() => Math.random() - 0.5).slice(0, count);
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
      const { data, error } = await supabase
        .from('mock_results')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, question:questions(*)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .ilike('question', `%${query}%`)
        .eq('active', true)
        .limit(50);
      if (error) throw error;
      return data as Question[];
    },
    enabled: query.trim().length > 2,
    staleTime: 1000 * 30,
  });
}
