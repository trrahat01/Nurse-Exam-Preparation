import { Query, ID, Permission, Role, account, databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS, isAppwriteConfigured } from './appwrite';
import { getSeenQuestionIds, filterUnseenQuestions, markQuestionsSeen, clearSeenQuestions } from './seenQuestions';
import { getMockQuestions, getMockQuestionsByCategory, getMockMockQuestions, getMockDailyQuestions } from './mockData';
import type { Question, MockResult, Bookmark, AnswerOption, ExamType, Category } from '@/src/types';
import { CATEGORY_CONFIG } from '@/src/types';

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
type QuestionStats = { total: number; seen: number; unseen: number };

// Helper: convert an Appwrite document to the app's Question type.
function mapQuestionDoc(doc: any): Question {
  return {
    id: doc.$id,
    category: doc.category || '',
    subcategory: doc.subcategory || '',
    exam_type: doc.exam_type || 'bpsc',
    subject: doc.subject || '',
    chapter: doc.chapter || '',
    question: doc.question || '',
    option_a: doc.option_a || '',
    option_b: doc.option_b || '',
    option_c: doc.option_c || '',
    option_d: doc.option_d || '',
    correct_answer: doc.correct_answer || 'a',
    explanation: doc.explanation || '',
    memory_tip: doc.memory_tip || '',
    solution_step: doc.solution_step || '',
    formula: doc.formula || '',
    difficulty: doc.difficulty || 'medium',
    importance: doc.importance ?? 3,
    tags: doc.tags || [],
    language: doc.language || 'english',
    verified: doc.verified ?? true,
    active: doc.active ?? true,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  if (!isAppwriteConfigured()) return null;
  try {
    const user = await account.get();
    return user.$id;
  } catch {
    return null;
  }
}

async function fetchQuestions(filters: { category?: string; subcategory?: string }, limit: number): Promise<Question[]> {
  if (!isAppwriteConfigured()) {
    let pool = getMockQuestions();
    if (filters.category) pool = pool.filter(q => q.category === filters.category);
    if (filters.subcategory) pool = pool.filter(q => q.subcategory === filters.subcategory);
    return shuffle(pool).slice(0, limit);
  }
  try {
    const queries: any[] = [Query.limit(Math.min(limit, 100))];
    if (filters.category) queries.push(Query.equal('category', [filters.category]));
    if (filters.subcategory) queries.push(Query.equal('subcategory', [filters.subcategory]));
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.questions, queries);
    return (res.documents as any[]).map(mapQuestionDoc);
  } catch {
    return getMockQuestions().slice(0, limit);
  }
}

// ── Stats / counts ──────────────────────────────────────────

export async function fetchCategoryQuestionStats(): Promise<Record<string, QuestionStats>> {
  const stats: Record<string, QuestionStats> = {};
  if (!isAppwriteConfigured()) {
    for (const q of getMockQuestions()) {
      const cat = q.category || 'Unknown';
      if (!stats[cat]) stats[cat] = { total: 0, seen: 0, unseen: 0 };
      stats[cat].total += 1;
      stats[cat].unseen += 1;
    }
    return stats;
  }
  try {
    const seenIds = await getSeenQuestionIds();
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.questions, [Query.limit(100), Query.select(['$id', 'category', 'active'])]);
    for (const d of res.documents as any[]) {
      if (d.active === false) continue;
      const cat = d.category || 'Unknown';
      if (!stats[cat]) stats[cat] = { total: 0, seen: 0, unseen: 0 };
      stats[cat].total += 1;
      if (seenIds.has(d.$id)) stats[cat].seen += 1; else stats[cat].unseen += 1;
    }
    return stats;
  } catch {
    return stats;
  }
}

export async function fetchTotalQuestionCount(): Promise<number> {
  if (!isAppwriteConfigured()) return getMockQuestions().length;
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.questions, [Query.limit(1), Query.select(['$id'])]);
    return res.total ?? getMockQuestions().length;
  } catch {
    return getMockQuestions().length;
  }
}

// ── Question/quiz fetchers ────────────────────────────────

export async function fetchMockQuestions(): Promise<Question[]> {
  if (!isAppwriteConfigured()) return getMockMockQuestions();
  try {
    const DIST: Record<string, number> = { Nursing: 60, 'General Knowledge': 15, English: 15, Bangla: 10 };
    let selected: Question[] = [];
    const seenIds = await getSeenQuestionIds();
    for (const [category, count] of Object.entries(DIST)) {
      const pool = await fetchQuestions({ category }, count * 2);
      const unseen = filterUnseenQuestions(pool, seenIds);
      selected.push(...shuffle(unseen).slice(0, count));
    }
    if (selected.length < 100) {
      const fallback = await fetchQuestions({}, 100 - selected.length);
      selected.push(...fallback.filter(q => !selected.some(s => s.id === q.id)));
    }
    const finalQuestions = shuffle(selected).slice(0, 100);
    if (finalQuestions.length > 0) await markQuestionsSeen(finalQuestions.map(q => q.id));
    return finalQuestions;
  } catch { return getMockMockQuestions(); }
}

export async function fetchDailyQuestions(count: number): Promise<Question[]> {
  if (!isAppwriteConfigured()) return getMockDailyQuestions(count);
  try {
    const pool = await fetchQuestions({}, count * 2);
    const seenIds = await getSeenQuestionIds();
    const unseen = filterUnseenQuestions(pool, seenIds);
    const result = shuffle(unseen).slice(0, count);
    if (result.length > 0) await markQuestionsSeen(result.map(q => q.id));
    return result;
  } catch { return getMockDailyQuestions(count); }
}

export async function fetchQuestionsByCategory(category: string, count: number): Promise<Question[]> {
  return (await fetchQuestions({ category }, count)).slice(0, count);
}

export async function fetchQuestionsBySubcategory(subcategory: string, page = 0, limit = 20): Promise<Question[]> {
  const pool = await fetchQuestions({ subcategory }, (page + 1) * limit);
  return pool.slice(page * limit, (page + 1) * limit);
}

export async function searchQuestions(query: string): Promise<Question[]> {
  const q = query.toLowerCase();
  if (!isAppwriteConfigured()) return getMockQuestions().filter(item => item.question.toLowerCase().includes(q)).slice(0, 50);
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.questions, [Query.search('question', q), Query.limit(50)]);
    return (res.documents as any[]).map(mapQuestionDoc);
  } catch {
    return getMockQuestions().filter(item => item.question.toLowerCase().includes(q)).slice(0, 50);
  }
}

// ── Results ────────────────────────────────────────────────

export async function fetchResults(userId: string): Promise<MockResult[]> {
  if (!isAppwriteConfigured()) return [];
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.results, [
      Query.equal('user_id', [userId]), Query.orderDesc('$createdAt'), Query.limit(20),
    ]);
    return (res.documents as any[]).map(d => ({ ...d, id: d.$id })) as unknown as MockResult[];
  } catch { return []; }
}

export async function saveResult(payload: { user_id: string; score: number; correct: number; wrong: number; skipped: number; percentage: number; time_taken: number; exam_type: ExamType }): Promise<MockResult | null> {
  if (!isAppwriteConfigured()) return null;
  try {
    const doc = await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.results, ID.unique(), payload, [
      Permission.read(Role.any()), Permission.write(Role.user(payload.user_id)),
    ]);
    return { ...doc, id: doc.$id } as unknown as MockResult;
  } catch { return null; }
}

// ── Bookmarks ────────────────────────────────────────────────

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  if (!isAppwriteConfigured()) return [];
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.bookmarks, [
      Query.equal('user_id', [userId]), Query.orderDesc('$createdAt'), Query.limit(100),
    ]);
    return (res.documents as any[]).map((d) => ({
      id: d.$id, user_id: d.user_id, question_id: d.question_id, created_at: d.$createdAt,
      question: d.question ? mapQuestionDoc(d.question) : undefined,
    })) as unknown as Bookmark[];
  } catch { return []; }
}

export async function toggleBookmark(userId: string, questionId: string, isBookmarked: boolean): Promise<void> {
  if (!isAppwriteConfigured()) return;
  try {
    if (isBookmarked) {
      const list = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.bookmarks, [
        Query.equal('user_id', [userId]), Query.equal('question_id', [questionId]), Query.limit(1),
      ]);
      if (list.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.bookmarks, list.documents[0].$id);
    } else {
      await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.bookmarks, ID.unique(), {
        user_id: userId, question_id: questionId,
      }, [Permission.read(Role.any()), Permission.write(Role.user(userId))]);
    }
  } catch {}
}

// ── History / misc ────────────────────────────────────────────

export async function clearQuestionHistory(): Promise<void> {
  await clearSeenQuestions();
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    const list = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.exposures, [
      Query.equal('user_id', [userId]), Query.limit(100),
    ]);
    await Promise.all(list.documents.map((d: any) => databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.exposures, d.$id)));
  } catch {}
}

export async function fetchCategories(): Promise<Category[]> {
  return Object.values(CATEGORY_CONFIG).map((cfg: any, i: number) => ({
    id: String(i + 1), name: cfg.name, slug: cfg.name.toLowerCase().replace(/\s+/g, '-'),
    icon: cfg.icon, color: cfg.color, bg_color: cfg.bgColor, description: cfg.description, order_index: i,
  }));
}

export async function fetchCategoryQuestionCounts(): Promise<Record<string, number>> {
  const stats = await fetchCategoryQuestionStats();
  const counts: Record<string, number> = {};
  for (const [cat, v] of Object.entries(stats)) counts[cat] = v.total;
  return counts;
}