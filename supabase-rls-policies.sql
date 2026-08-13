-- ============================================================================
-- Supabase Row Level Security (RLS) — copy & run this in your Supabase
-- SQL Editor (free). Adjust column names if your tables differ.
--
-- Purpose: with the anon (public) key in the app, RLS is what prevents any
-- user from reading/writing OTHER users' data. Enable it on every table.
-- ============================================================================

-- 1) PROFILES: each user only manages their OWN profile row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Allow users to create their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- 2) BOOKMARKS: only owner can read / insert / delete
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_own" ON public.bookmarks;
CREATE POLICY "bookmarks_select_own" ON public.bookmarks
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bookmarks_insert_own" ON public.bookmarks;
CREATE POLICY "bookmarks_insert_own" ON public.bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "bookmarks_delete_own" ON public.bookmarks;
CREATE POLICY "bookmarks_delete_own" ON public.bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- 3) MOCK RESULTS: only owner
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mock_results_select_own" ON public.mock_results;
CREATE POLICY "mock_results_select_own" ON public.mock_results
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "mock_results_insert_own" ON public.mock_results;
CREATE POLICY "mock_results_insert_own" ON public.mock_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4) QUESTION EXPOSURES (seen-questions history): only owner
ALTER TABLE public.question_exposures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qe_select_own" ON public.question_exposures;
CREATE POLICY "qe_select_own" ON public.question_exposures
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "qe_insert_own" ON public.question_exposures;
CREATE POLICY "qe_insert_own" ON public.question_exposures
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "qe_delete_own" ON public.question_exposures;
CREATE POLICY "qe_delete_own" ON public.question_exposures
  FOR DELETE USING (user_id = auth.uid());

-- 5) QUESTIONS: public read (everyone can take quizzes), NOT writable
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_read_public" ON public.questions;
CREATE POLICY "questions_read_public" ON public.questions
  FOR SELECT USING (true);

-- NOTE: If you add a "premium" gate later, restrict questions (or lesson content)
-- by only granting SELECT where a subscription flag is active, e.g.:
--   FOR SELECT USING (true); -- replace with a premium check if you monetize content
