import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';
import type { Question, MockResult, Bookmark } from '../types';

const isSupabaseConfigured = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
};

export function useSubcategoryQuestions(subcategory: string, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'sub', userId, subcategory],
    queryFn: async () => {
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('questions').select('*').eq('subcategory', subcategory).eq('active', true).limit(50);
      if (error) throw error;
      return (data as Question[]) || [];
    },
    enabled: !!subcategory && !!userId,
  });
}

export function useCategoryQuestions(category: string, count: number, userId?: string) {
  return useQuery({
    queryKey: ['questions', 'cat', userId, category, count],
    queryFn: async () => {
      if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('questions').select('*').eq('category', category).eq('active', true).limit(count);
      if (error) throw error;
      return (data as Question[]) || [];
    },
    enabled: !!category && !!userId,
  });
}

export function useBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [] as Bookmark[];
      const supabase = getSupabaseClient();
      if (!supabase) return [] as Bookmark[];
      const { data, error } = await supabase.from('bookmarks').select('*, question:questions(*)').eq('user_id', userId!).order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Bookmark[]) || [];
    },
    enabled: !!userId,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({userId, questionId, isBookmarked}: {userId: string, questionId: string, isBookmarked: boolean}) => {
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', userId).eq('question_id', questionId);
      } else {
        await supabase.from('bookmarks').insert({ user_id: userId, question_id: questionId });
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['bookmarks', vars.userId] });
    },
  });
}

export { getSupabaseClient };