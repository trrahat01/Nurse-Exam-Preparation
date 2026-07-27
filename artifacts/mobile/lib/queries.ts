import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType } from './types';
import { MOCK_DISTRIBUTION } from './types';
import { 
  getMockQuestionsBySubcategory, 
  getMockQuestionsByCategory, 
  getShuffledMockQuestions,
  MOCK_QUESTIONS 
} from './mockData';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
};

// ─── Questions ────────────────────────────────────────────────────────────────

export function useSubcategoryQuestions(subcategory: string) {
  return useQuery({
    queryKey: ['questions', 'sub', subcategory],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        // Use mock data when Supabase is not configured
        return getMockQuestionsBySubcategory(subcategory);
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory', subcategory)
        .eq('active', true)
        .limit(100);
      if (error) throw error;
      if (!data || data.length === 0) {
        // Fallback to mock if no data from Supabase
        return getMockQuestionsBySubcategory(subcategory);
      }
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
      if (!isSupabaseConfigured()) {
        return getMockQuestionsByCategory(category, count);
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .limit(count * 3);
      if (error) throw error;
      if (!data || data.length === 0) {
        return getMockQuestionsByCategory(category, count);
      }
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
      
      if (!isSupabaseConfigured()) {
        // Use mock data distribution
        let allQuestions: Question[] = [];
        Object.entries(MOCK_DISTRIBUTION).forEach(([cat, count]) => {
          const catQuestions = MOCK_QUESTIONS.filter(q => q.category === cat);
          allQuestions = [...allQuestions, ...shuffle(catQuestions).slice(0, count)];
        });
        return shuffle(allQuestions);
      }
      
      const fetches = Object.entries(MOCK_DISTRIBUTION).map(([cat, count]) =>
        supabase
          .from('questions')
          .select('*')
          .eq('category', cat)
          .eq('active', true)
          .limit(count * 3)
          .then(({ data, error }) => {
            if (error) throw error;
            if (!data || data.length === 0) {
              const catQuestions = MOCK_QUESTIONS.filter(q => q.category === cat);
              return shuffle(catQuestions).slice(0, count);
            }
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
      if (!isSupabaseConfigured()) {
        return getShuffledMockQuestions(count);
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('active', true)
        .limit(count * 4);
      if (error) throw error;
      if (!data || data.length === 0) {
        return getShuffledMockQuestions(count);
      }
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
      if (!isSupabaseConfigured()) {
        return [] as MockResult[];
      }
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
        // Search in mock data
        const lowerQuery = query.toLowerCase();
        return MOCK_QUESTIONS.filter(q => 
          q.question.toLowerCase().includes(lowerQuery) ||
          q.subcategory.toLowerCase().includes(lowerQuery)
        ).slice(0, 50);
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .ilike('question', `%${query}%`)
        .eq('active', true)
        .limit(50);
      if (error) throw error;
      if (!data || data.length === 0) {
        const lowerQuery = query.toLowerCase();
        return MOCK_QUESTIONS.filter(q => 
          q.question.toLowerCase().includes(lowerQuery) ||
          q.subcategory.toLowerCase().includes(lowerQuery)
        ).slice(0, 50);
      }
      return data as Question[];
    },
    enabled: query.trim().length > 2,
    staleTime: 1000 * 30,
  });
}
