import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExamResult } from '@/src/types';

const XP_KEY = 'gamification_xp';
const BADGES_KEY = 'gamification_badges';

export const XP_PER_CORRECT = 10;
export const XP_EXAM_COMPLETED = 15;
export const XP_MOCK_PASS_BONUS = 100;
export const XP_PER_LEVEL = 250;

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number;
}

/** Level N starts at (N-1)*250 XP. Level 1 = 0 XP, level 2 = 250 XP, etc. */
export function computeLevel(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    progressPct: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
  };
}

export interface GamificationState extends LevelInfo {
  xp: number;
  earnedBadges: string[];
}

export async function getGamification(): Promise<GamificationState> {
  try {
    const xp = parseInt((await AsyncStorage.getItem(XP_KEY)) || '0', 10) || 0;
    const raw = await AsyncStorage.getItem(BADGES_KEY);
    const earned: string[] = raw ? JSON.parse(raw) : [];
    return { xp, ...computeLevel(xp), earnedBadges: Array.isArray(earned) ? earned : [] };
  } catch {
    return { xp: 0, ...computeLevel(0), earnedBadges: [] };
  }
}

export interface BadgeCtx {
  exams: number;
  streak: number;
  totalCorrect: number;
  maxScorePct: number;
  categoryCorrect: Record<string, number>;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  requires: (ctx: BadgeCtx) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_steps', name: 'First Steps', desc: 'Complete your first exam', icon: 'trophy-outline', color: '#0891B2', requires: (c) => c.exams >= 1 },
  { id: 'veteran', name: 'Veteran', desc: 'Complete 10 exams', icon: 'medal-outline', color: '#059669', requires: (c) => c.exams >= 10 },
  { id: 'legend', name: 'Legend', desc: 'Complete 50 exams', icon: 'trophy', color: '#D97706', requires: (c) => c.exams >= 50 },
  { id: 'on_fire', name: 'On Fire', desc: 'Reach a 7-day study streak', icon: 'fire', color: '#F97316', requires: (c) => c.streak >= 7 },
  { id: 'century', name: 'Century Club', desc: '100 correct answers', icon: 'counter', color: '#7C3AED', requires: (c) => c.totalCorrect >= 100 },
  { id: 'quiz_master', name: 'Quiz Master', desc: '500 correct answers', icon: 'star', color: '#EAB308', requires: (c) => c.totalCorrect >= 500 },
  { id: 'sharp_shooter', name: 'Sharp Shooter', desc: 'Score 90% or more on any exam', icon: 'target', color: '#DC2626', requires: (c) => c.maxScorePct >= 90 },
  { id: 'pharma_pro', name: 'Pharmacology Pro', desc: '50 correct answers in Pharmacology', icon: 'pill', color: '#0EA5E9', requires: (c) => (c.categoryCorrect['Pharmacology'] || 0) >= 50 },
  { id: 'med_surg_pro', name: 'Med-Surg Pro', desc: '50 correct in Medical Surgical Nursing', icon: 'hospital-box', color: '#0891B2', requires: (c) => (c.categoryCorrect['Medical Surgical Nursing'] || 0) >= 50 },
  { id: 'pediatrics_pro', name: 'Pediatrics Pro', desc: '50 correct in Pediatric Nursing', icon: 'baby-face-outline', color: '#EC4899', requires: (c) => (c.categoryCorrect['Pediatric Nursing'] || 0) >= 50 },
  { id: 'fundamentals_pro', name: 'Fundamentals Pro', desc: '50 correct in Fundamentals of Nursing', icon: 'book-check', color: '#10B981', requires: (c) => (c.categoryCorrect['Fundamentals of Nursing'] || 0) >= 50 },
];

function buildBadgeCtx(correct: number, streakCurrent: number, savedResults: ExamResult[]): BadgeCtx {
  const exams = savedResults.length;
  const totalCorrect = savedResults.reduce((s, r) => s + r.correct, 0) + correct;
  const maxScorePct = savedResults.length ? Math.max(...savedResults.map((r) => r.percentage)) : 0;
  const categoryCorrect: Record<string, number> = {};
  savedResults.forEach((r) => {
    Object.entries(r.categoryBreakdown ?? {}).forEach(([cat, v]) => {
      categoryCorrect[cat] = (categoryCorrect[cat] || 0) + v.correct;
    });
  });
  return { exams, streak: Math.max(0, streakCurrent), totalCorrect, maxScorePct, categoryCorrect };
}

export interface CategoryStat {
  category: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
}

/** Per-category leaderboard computed from all saved exam results. */
export function computeCategoryStats(savedResults: ExamResult[]): CategoryStat[] {
  const map: Record<string, { correct: number; wrong: number }> = {};
  savedResults.forEach((r) => {
    Object.entries(r.categoryBreakdown ?? {}).forEach(([cat, v]) => {
      const e = map[cat] || { correct: 0, wrong: 0 };
      e.correct += v.correct;
      e.wrong += v.wrong;
      map[cat] = e;
    });
  });
  return Object.entries(map)
    .map(([category, v]) => ({
      category,
      correct: v.correct,
      wrong: v.wrong,
      total: v.correct + v.wrong,
      accuracy: v.correct + v.wrong > 0 ? Math.round((v.correct / (v.correct + v.wrong)) * 100) : 0,
    }))
    .sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
}

export interface GamificationAwardArgs {
  correct: number;
  examCompleted?: boolean;
  isMockPassed?: boolean;
  streakCurrent?: number;
  savedResults?: ExamResult[];
}

export interface GamificationAward {
  xpGained: number;
  newlyEarned: BadgeDef[];
}

/**
 * Awards XP (per correct answer + per exam + mock-pass bonus), recomputes level,
 * evaluates badges, and persists. Call after an exam finishes via submitExam.
 *
 * Never throws: failures are swallowed so the exam flow is never blocked.
 */
export async function awardGamification(args: GamificationAwardArgs): Promise<GamificationAward> {
  const state = await getGamification();
  const gained =
    (args.correct || 0) * XP_PER_CORRECT +
    (args.examCompleted ? XP_EXAM_COMPLETED : 0) +
    (args.isMockPassed ? XP_MOCK_PASS_BONUS : 0);
  const xp = state.xp + gained;
  const ctx: BadgeCtx = buildBadgeCtx(args.correct || 0, args.streakCurrent || 0, args.savedResults || []);
  const newly = BADGES.filter((b) => !state.earnedBadges.includes(b.id) && b.requires(ctx));
  try {
    await AsyncStorage.setItem(XP_KEY, String(xp));
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify([...state.earnedBadges, ...newly.map((b) => b.id)]));
  } catch {
    // ignore
  }
  return { xpGained: gained, newlyEarned: newly };
}