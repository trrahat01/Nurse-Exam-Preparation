import type { ExamResult } from '@/src/types';

export type ReadinessLevel = 'not_ready' | 'getting_there' | 'ready';

export interface ReadinessResult {
  percentage: number;
  level: ReadinessLevel;
  label: string;
  advice: string;
  mockCount: number;
  isEstimate: boolean;
}

/**
 * Predicts NCLEX-style exam readiness from saved exam results.
 *
 * Blend: 70% recent mock score, 20% overall accuracy, 10% consistency bonus.
 */
export function computeReadiness(results: ExamResult[]): ReadinessResult {
  const exams = results.filter((r) => r.examType === 'mock');
  const mockCount = exams.length;

  if (!results.length) {
    return {
      percentage: 0,
      level: 'not_ready',
      label: 'Not ready yet',
      advice: 'Complete a mock exam to get your predicted NCLEX readiness score.',
      mockCount: 0,
      isEstimate: false,
    };
  }

  // Weighted average of the last 5 mock scores (most recent counts most).
  const weights = [1, 0.85, 0.7, 0.55, 0.4];
  const recent = exams.slice(0, 5);
  const mockAvg = recent.length
    ? Math.round(
        recent.reduce((s, r, i) => s + r.percentage * (weights[i] ?? 0.4), 0) /
          recent.reduce((s, _r, i) => s + (weights[i] ?? 0.4), 0),
      )
    : 0;

  const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = results.reduce((s, r) => s + r.questions.length, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Consistency bonus: up to +10 once the user has done many exams.
  const consistencyBonus = Math.min(10, Math.floor(results.length / 2));

  const raw =
    mockCount > 0
      ? 0.7 * mockAvg + 0.2 * overallAccuracy + consistencyBonus
      : 0.8 * overallAccuracy + consistencyBonus;

  const percentage = Math.max(0, Math.min(100, Math.round(raw)));

  let level: ReadinessLevel;
  let label: string;
  let advice: string;

  if (percentage >= 75) {
    level = 'ready';
    label = 'Ready!';
    advice = 'You are predicted exam-ready. Keep a light review streak until exam day.';
  } else if (percentage >= 50) {
    level = 'getting_there';
    label = 'Getting There';
    advice = 'You are close. Focus on your weak categories and retake mocks to push past 75%.';
  } else {
    level = 'not_ready';
    label = 'Keep Practicing';
    advice = 'More mock practice will raise your predicted readiness. Target 75%+ in mocks.';
  }

  return {
    percentage,
    level,
    label,
    advice,
    mockCount,
    isEstimate: mockCount < 3 && mockCount > 0,
  };
}