import React, {
  createContext, useCallback, useContext, useEffect,
  useRef, useState,
} from 'react';
import type { AnswerOption, ExamResult, ExamType, Question } from '@/lib/types';

interface ExamContextValue {
  // Session state
  session: {
    examType: ExamType;
    questions: Question[];
    answers: Record<string, AnswerOption | null>;
    markedForReview: string[];
    currentIndex: number;
    timeLeft: number;
    timeLimit: number;
    isRunning: boolean;
  } | null;
  result: ExamResult | null;
  // Actions
  startExam: (questions: Question[], type: ExamType, timeLimit?: number) => void;
  setAnswer: (questionId: string, answer: AnswerOption) => void;
  toggleMark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  submitExam: () => ExamResult;
  clearExam: () => void;
}

const ExamContext = createContext<ExamContextValue | null>(null);

const EXAM_TIME: Record<ExamType, number> = {
  mock: 3600,
  daily_20: 1200,
  daily_50: 3000,
  daily_100: 6000,
  challenge: 1800,
  practice: 0, // no timer
};

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ExamContextValue['session']>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef = useRef<(() => ExamResult) | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startExam = useCallback(
    (questions: Question[], type: ExamType, timeLimit?: number) => {
      clearTimer();
      setResult(null);
      const limit = timeLimit ?? EXAM_TIME[type];
      setSession({
        examType: type,
        questions,
        answers: {},
        markedForReview: [],
        currentIndex: 0,
        timeLeft: limit,
        timeLimit: limit,
        isRunning: true,
      });
    },
    [clearTimer]
  );

  // Tick the timer every second
  useEffect(() => {
    if (!session?.isRunning || session.examType === 'practice') return;

    timerRef.current = setInterval(() => {
      setSession(prev => {
        if (!prev) return prev;
        if (prev.timeLeft <= 1) {
          clearTimer();
          // Auto-submit via ref to avoid stale closure
          if (submitRef.current) submitRef.current();
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [session?.isRunning, session?.examType, clearTimer]);

  const setAnswer = useCallback((questionId: string, answer: AnswerOption) => {
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, answers: { ...prev.answers, [questionId]: answer } };
    });
  }, []);

  const toggleMark = useCallback((questionId: string) => {
    setSession(prev => {
      if (!prev) return prev;
      const marked = prev.markedForReview.includes(questionId)
        ? prev.markedForReview.filter(id => id !== questionId)
        : [...prev.markedForReview, questionId];
      return { ...prev, markedForReview: marked };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, currentIndex: index };
    });
  }, []);

  const submitExam = useCallback((): ExamResult => {
    clearTimer();
    let examResult: ExamResult;

    setSession(prev => {
      if (!prev) {
        examResult = { score: 0, correct: 0, wrong: 0, skipped: 0, percentage: 0, timeTaken: 0, passed: false, examType: 'mock', answers: {}, questions: [] };
        return prev;
      }

      const { questions, answers, timeLeft, examType } = prev;
      const timeLimit = EXAM_TIME[examType];
      const timeTaken = timeLimit - timeLeft;

      let correct = 0, wrong = 0, skipped = 0;
      questions.forEach(q => {
        const ans = answers[q.id];
        if (!ans) { skipped++; }
        else if (ans === q.correct_answer) { correct++; }
        else { wrong++; }
      });

      const score = correct;
      const percentage = Math.round((correct / questions.length) * 100);
      const passed = percentage >= 50;

      examResult = { score, correct, wrong, skipped, percentage, timeTaken, passed, examType, answers, questions };
      return { ...prev, isRunning: false };
    });

    setTimeout(() => {
      setResult(examResult);
    }, 0);

    return examResult!;
  }, [clearTimer]);

  // Keep submitRef in sync
  submitRef.current = submitExam;

  const clearExam = useCallback(() => {
    clearTimer();
    setSession(null);
    setResult(null);
  }, [clearTimer]);

  return (
    <ExamContext.Provider value={{
      session, result,
      startExam, setAnswer, toggleMark, goToQuestion,
      submitExam, clearExam,
    }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam must be used within ExamProvider');
  return ctx;
}
