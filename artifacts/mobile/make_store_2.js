const fs = require('fs');
const p2 = `
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
          result = { score: correct, correct, wrong, skipped, percentage, timeTaken, passed, examType, answers, questions, categoryBreakdown };
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

  clearExam: () => set({ session: null, result: null, submitError: null }),
  viewResult: (result) => set({ result }),

  saveResult: async (result) => {
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
      set({ submitError: null });
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
`;
fs.appendFileSync('artifacts/mobile/src/store/examStore.ts', p2, 'utf8');
console.log('Appended part 2');
