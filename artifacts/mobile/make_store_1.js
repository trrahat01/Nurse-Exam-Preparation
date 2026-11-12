const fs = require('fs');
const p1 = `import { create } from 'zustand';
import type { ExamSession, ExamResult, ExamType, Question, AnswerOption, MockResult } from '@/src/types';
import { useBookmarkStore } from './bookmarkStore';
import { saveExamResultToSupabase } from '@/src/lib/queries';
import { useAuthStore } from './authStore';

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
`;
fs.writeFileSync('artifacts/mobile/src/store/examStore.ts', p1, 'utf8');
console.log('Wrote part 1');
