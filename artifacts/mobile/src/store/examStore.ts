import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExamSession, ExamResult, ExamType, Question, AnswerOption } from '@/src/types';

const EXAM_TIME: Record<ExamType, number> = {
  mock: 3600,
  daily_20: 1200,
  daily_50: 3000,
  daily_100: 6000,
  challenge: 1800,
  practice: 0,
};

interface ExamState {
  session: ExamSession | null;
  result: ExamResult | null;
  savedResults: ExamResult[];
  isLoading: boolean;
  startExam: (questions: Question[], type: ExamType, timeLimit?: number) => void;
  setAnswer: (questionId: string, answer: AnswerOption) => void;
  toggleMark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  submitExam: () => ExamResult;
  clearExam: () => void;
  loadSavedResults: () => Promise<void>;
  saveResult: (result: ExamResult) => Promise<void>;
  viewResult: (result: ExamResult) => void;
  tickTimer: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  session: null,
  result: null,
  savedResults: [],
  isLoading: false,

  startExam: (questions, type, timeLimit) => {
    const limit = timeLimit ?? EXAM_TIME[type];
    set({
      session: {
        examType: type,
        questions,
        answers: {},
        markedForReview: [],
        currentIndex: 0,
        timeLeft: limit,
        isRunning: true,
        startTime: Date.now(),
      },
      result: null,
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

  goToQuestion: (index) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, currentIndex: index } });
  },

  submitExam: () => {
    const { session } = get();
    if (!session) throw new Error('No active exam session');
    const { questions, answers, timeLeft, examType, startTime } = session;
    const timeLimit = EXAM_TIME[examType];
    const timeTaken = timeLimit > 0 ? timeLimit - timeLeft : Math.floor((Date.now() - startTime) / 1000);
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
    const result: ExamResult = { score: correct, correct, wrong, skipped, percentage, timeTaken, passed, examType, answers, questions, categoryBreakdown };
    set({ session: { ...session, isRunning: false }, result });
    get().saveResult(result);
    return result;
  },

  clearExam: () => set({ session: null, result: null }),

  viewResult: (result) => set({ result }),

  loadSavedResults: async () => {
    try {
      const data = await AsyncStorage.getItem('exam_results');
      if (data) set({ savedResults: JSON.parse(data) });
    } catch (e) { console.error('Failed to load results:', e); }
  },

  saveResult: async (result) => {
    try {
      const { savedResults } = get();
      const updated = [result, ...savedResults].slice(0, 50);
      await AsyncStorage.setItem('exam_results', JSON.stringify(updated));
      set({ savedResults: updated });
    } catch (e) { console.error('Failed to save result:', e); }
  },

  tickTimer: () => {
    const { session } = get();
    if (!session || !session.isRunning || session.examType === 'practice') return;
    if (session.timeLeft <= 1) { get().submitExam(); return; }
    set({ session: { ...session, timeLeft: session.timeLeft - 1 } });
  },
}));