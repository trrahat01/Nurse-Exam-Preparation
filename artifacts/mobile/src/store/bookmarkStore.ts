import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Question } from '@/src/types';

const BOOKMARKS_KEY = 'local_bookmarks';

export interface BookmarkItem {
  id: string;
  question_id: string;
  question: Question;
  created_at: string;
}

interface BookmarkState {
  bookmarks: BookmarkItem[];
  serverBookmarks: BookmarkItem[];
  isLoading: boolean;
  loadBookmarks: () => Promise<void>;
  loadServerBookmarks: (bookmarks: BookmarkItem[]) => void;
  addBookmark: (question: Question) => Promise<void>;
  removeBookmark: (questionId: string) => Promise<void>;
  isBookmarked: (questionId: string) => boolean;
  findBookmark: (questionId: string) => BookmarkItem | undefined;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  serverBookmarks: [],
  isLoading: false,

  loadBookmarks: async () => {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (data) {
        set({ bookmarks: JSON.parse(data) });
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
  },

  loadServerBookmarks: (bookmarks) => {
    set({ serverBookmarks: bookmarks });
  },

  addBookmark: async (question) => {
    const { bookmarks } = get();
    if (bookmarks.some(b => b.question_id === question.id)) return;
    const item: BookmarkItem = {
      id: `local_${Date.now()}_${question.id}`,
      question_id: question.id,
      question,
      created_at: new Date().toISOString(),
    };
    const updated = [item, ...bookmarks];
    set({ bookmarks: updated });
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save bookmark:', e);
    }
  },

  removeBookmark: async (questionId) => {
    const { bookmarks } = get();
    const updated = bookmarks.filter(b => b.question_id !== questionId);
    set({ bookmarks: updated });
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove bookmark:', e);
    }
  },

  isBookmarked: (questionId) => {
    const { bookmarks, serverBookmarks } = get();
    return bookmarks.some(b => b.question_id === questionId) || serverBookmarks.some(b => b.question_id === questionId);
  },

  findBookmark: (questionId) => {
    const { bookmarks, serverBookmarks } = get();
    return bookmarks.find(b => b.question_id === questionId) || serverBookmarks.find(b => b.question_id === questionId);
  },
}));
