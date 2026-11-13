import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../src/lib/supabase';
import type { Question, MockResult, Bookmark } from '../src/types';

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

export { getSupabaseClient };