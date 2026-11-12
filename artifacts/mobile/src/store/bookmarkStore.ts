import { create } from 'zustand';
import type { Bookmark, Question } from '@/src/types';
import { fetchBookmarks, toggleBookmark as apiToggleBookmark } from '@/src/lib/queries';
import { useAuthStore } from './authStore';

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  pendingQuestionIds: Record<string, boolean>;
  loadBookmarks: () => Promise<void>;
  toggleBookmark: (question: Question) => Promise<void>;
  addBookmark: (question: Question) => Promise<void>;
  removeBookmark: (questionId: string) => Promise<void>;
  isBookmarked: (questionId: string) => boolean;
  findBookmark: (questionId: string) => Bookmark | undefined;
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,
  pendingQuestionIds: {},

  loadBookmarks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ bookmarks: [], isLoading: false, error: null });
      return;
    }

    const targetUserId = user.id;
    set({ isLoading: true, error: null });

    try {
      const serverBookmarks = await fetchBookmarks(targetUserId);

      // Verify user hasn't switched accounts while request was in-flight
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id !== targetUserId) {
        return;
      }

      set({ bookmarks: serverBookmarks, isLoading: false, error: null });
    } catch (e: any) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id !== targetUserId) {
        return;
      }

      console.error('Failed to load bookmarks from Supabase:', e);
      set({ isLoading: false, error: e?.message || 'Failed to load bookmarks' });
    }
  },

  toggleBookmark: async (question: Question) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    const questionId = question.id;
    const targetUserId = user.id;
    const { pendingQuestionIds, bookmarks } = get();

    if (pendingQuestionIds[questionId]) return;

    set({ pendingQuestionIds: { ...pendingQuestionIds, [questionId]: true }, error: null });

    const currentlyBookmarked = bookmarks.some((b) => b.question_id === questionId);

    try {
      await apiToggleBookmark(targetUserId, questionId, currentlyBookmarked);

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id !== targetUserId) {
        set({
          pendingQuestionIds: { ...get().pendingQuestionIds, [questionId]: false },
        });
        return;
      }

      let updated: Bookmark[];
      const latestBookmarks = get().bookmarks;
      if (currentlyBookmarked) {
        updated = latestBookmarks.filter((b) => b.question_id !== questionId);
      } else {
        const newBookmark: Bookmark = {
          id: `bm_${Date.now()}_${questionId}`,
          user_id: targetUserId,
          question_id: questionId,
          created_at: new Date().toISOString(),
          question,
        };
        if (!latestBookmarks.some((b) => b.question_id === questionId)) {
          updated = [newBookmark, ...latestBookmarks];
        } else {
          updated = latestBookmarks;
        }
      }

      set({
        bookmarks: updated,
        pendingQuestionIds: { ...get().pendingQuestionIds, [questionId]: false },
        error: null,
      });
    } catch (e: any) {
      console.error('Failed to toggle bookmark on server:', e);
      set({
        error: e?.message || 'Failed to update bookmark',
        pendingQuestionIds: { ...get().pendingQuestionIds, [questionId]: false },
      });
    }
  },

  // Legacy/Explicit Aliases
  addBookmark: async (question: Question) => {
    const { isBookmarked, toggleBookmark } = get();
    if (!isBookmarked(question.id)) {
      await toggleBookmark(question);
    }
  },

  removeBookmark: async (questionId: string) => {
    const { findBookmark, toggleBookmark } = get();
    const bookmark = findBookmark(questionId);
    if (bookmark && bookmark.question) {
      await toggleBookmark(bookmark.question);
    } else {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const targetUserId = user.id;
      const { pendingQuestionIds } = get();

      if (pendingQuestionIds[questionId]) return;

      set({ pendingQuestionIds: { ...pendingQuestionIds, [questionId]: true }, error: null });
      try {
        await apiToggleBookmark(targetUserId, questionId, true);

        const currentUser = useAuthStore.getState().user;
        if (currentUser?.id === targetUserId) {
          set({
            bookmarks: get().bookmarks.filter(b => b.question_id !== questionId),
            pendingQuestionIds: { ...get().pendingQuestionIds, [questionId]: false },
            error: null,
          });
        }
      } catch (e: any) {
        set({
          error: e?.message || 'Failed to remove bookmark',
          pendingQuestionIds: { ...get().pendingQuestionIds, [questionId]: false },
        });
      }
    }
  },

  isBookmarked: (questionId: string) => {
    const { bookmarks } = get();
    return bookmarks.some(b => b.question_id === questionId);
  },

  findBookmark: (questionId: string) => {
    const { bookmarks } = get();
    return bookmarks.find(b => b.question_id === questionId);
  },

  clearBookmarks: () => {
    set({ bookmarks: [], isLoading: false, error: null, pendingQuestionIds: {} });
  },
}));

// Automatically sync bookmarks when auth user changes / account switches
useAuthStore.subscribe((state, previousState) => {
  if (state.user?.id !== previousState.user?.id) {
    if (!state.user) {
      useBookmarkStore.getState().clearBookmarks();
    } else {
      useBookmarkStore.getState().loadBookmarks();
    }
  }
});
