import { create } from 'zustand';
import type { ExamSession, ExamResult, ExamType, Question, AnswerOption, MockResult } from '@/src/types';
import { useBookmarkStore } from './bookmarkStore';
import { saveExamResultToSupabase } from '@/src/lib/queries';
import { useAuthStore } from './authStore';

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 1
    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const EXAM_TIME: Record<ExamType, number> = {
  mock: 3600,
  daily_20: 1200,
  daily_50: 3000,
  daily_100: 6000,
  challenge: 1800,
  practice: 0,
};

let operationLock: Promise<any> | null = null;

interface ExamState {
  session: ExamSession | null;
  result: ExamResult | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  savedResultId: string | null;
  startExam: (questions: Question[], type: ExamType, timeLimit?: number) => void;
  setAnswer: (questionId: string, answer: AnswerOption) => void;
  toggleMark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  submitExam: () => Promise<ExamResult>;
  clearExam: () => void;
  saveResult: (result: ExamResult) => Promise<void>;
  _saveResultInternal: (result: ExamResult) => Promise<void>;
  viewResult: (result: ExamResult) => void;
  tickTimer: () => void;
  toggleBookmarkQuestion: (questionId: string) => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  session: null,
  result: null,
  isLoading: false,
  isSubmitting: false,
  submitError: null,
  savedResultId: null,

  startExam: (questions, type, timeLimit) => {
    const limit = timeLimit ?? EXAM_TIME[type];
    set({
      session: {
        examType: type,
        questions: questions.map(q => ({ ...q, isBookmarked: false })),
        answers: {},
        markedForReview: [],
        currentIndex: 0,
        timeLeft: limit,
        isRunning: true,
        startTime: Date.now(),
      },
      result: null,
      submitError: null,
      savedResultId: null,
    });
  },

  setAnswer: (questionId, answer) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, answers: { ...session.answers, [questionId]: answer } } });
  },

  toggleMark: (questionId) => {
    const { session } = get();
    if (!session) return;
    const marked = session.markedForReview.includes(questionId)
      ? session.markedForReview.filter(id => id !== questionId)
      : [...session.markedForReview, questionId];
    set({ session: { ...session, markedForReview: marked } });
  },

  toggleBookmarkQuestion: async (questionId) => {
    const { session } = get();
    if (!session) return;
    const question = session.questions.find(q => q.id === questionId);
    if (!question) return;
    try {
      await useBookmarkStore.getState().toggleBookmark(question);
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  },

  goToQuestion: (index) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, currentIndex: index } });
  },

  submitExam: async () => {
    const { session, result: existingResult } = get();
    if (!session) throw new Error('No active exam session');
    if (!session.isRunning && existingResult && !get().submitError) return existingResult;
    if (operationLock) return operationLock;

    const lockPromise = (async () => {
      set({ isSubmitting: true, submitError: null });
      let result = existingResult;
      try {
        if (session.isRunning) {
          const { questions, answers, examType, startTime } = session;
          const timeTaken = Math.round((Date.now() - startTime) / 1000);
          let correct = 0, wrong = 0, skipped = 0;
          const categoryBreakdown: Record<string, { correct: number; wrong: number; skipped: number }> = {};
          questions.forEach(q => {
            if (!categoryBreakdown[q.category]) categoryBreakdown[q.category] = { correct: 0, wrong: 0, skipped: 0 };
            const ans = answers[q.id];
            if (!ans) { skipped++; categoryBreakdown[q.category].skipped++; }
            else if (ans === q.correct_answer) { correct++; categoryBreakdown[q.category].correct++; }
            else { wrong++; categoryBreakdown[q.category].wrong++; }
          });
          const percentage = Math.round((correct / questions.length) * 100);
          const passed = percentage >= 50;
          const resultId = generateUUID();
          result = { id: resultId, score: correct, correct, wrong, skipped, percentage, timeTaken, passed, examType, answers, questions, categoryBreakdown };
          set({ session: { ...session, isRunning: false }, result });
        }
        if (!result) throw new Error('No result to save');
        await get()._saveResultInternal(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        set({ submitError: err.message });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    })();

    operationLock = lockPromise;
    try {
      return await lockPromise;
    } finally {
      operationLock = null;
    }
  },

  clearExam: () => set({ session: null, result: null, submitError: null, savedResultId: null }),
  viewResult: (result) => set({ result }),

  saveResult: async (result) => {
    const { savedResultId } = get();
    if (savedResultId === result.id) return;
    if (operationLock) {
      await operationLock;
      return;
    }
    const lockPromise = (async () => {
      set({ isSubmitting: true, submitError: null });
      try {
        await get()._saveResultInternal(result);
      } finally {
        set({ isSubmitting: false });
      }
    })();
    operationLock = lockPromise;
    try {
      await lockPromise;
    } finally {
      operationLock = null;
    }
  },

  _saveResultInternal: async (result: ExamResult) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      const error = new Error('Cannot save exam result: No authenticated user.');
      set({ submitError: error.message });
      throw error;
    }
    try {
      const mockResult = {
        id: result.id,
        user_id: user.id,
        score: result.score,
        correct: result.correct,
        wrong: result.wrong,
        skipped: result.skipped,
        percentage: result.percentage,
        time_taken: result.timeTaken,
        exam_type: result.examType,
        total_questions: result.questions?.length ?? (result.correct + result.wrong + result.skipped),
        category_breakdown: result.categoryBreakdown,
      };
      await saveExamResultToSupabase(mockResult as any, user.id);
      set({ savedResultId: result.id, submitError: null });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      set({ submitError: err.message });
      throw err;
    }
  },

  tickTimer: () => {
    const { session } = get();
    if (!session || !session.isRunning || session.examType === 'practice') return;
    if (session.timeLeft <= 1) { get().submitExam(); return; }
    set({ session: { ...session, timeLeft: session.timeLeft - 1 } });
  },
}));
