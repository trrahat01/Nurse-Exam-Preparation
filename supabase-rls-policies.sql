-- ============================================================================
-- Supabase RLS + missing `profiles` table
-- Run this after supabase-schema.sql. It is safe to re-run (uses IF NOT EXISTS /
-- guarded DDL). Each RLS block only runs if the table exists.
-- ============================================================================

-- 1) The app's "Edit Profile" screen writes to a `profiles` table, which the
--    original schema did not create. Create it now (if not present).
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  district    TEXT,
  exam_target TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Helper style: guard every block so a missing table never aborts the script.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    CREATE POLICY "profiles_select_own" ON public.profiles
      FOR SELECT USING (id = auth.uid());
    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
    CREATE POLICY "profiles_insert_own" ON public.profiles
      FOR INSERT WITH CHECK (id = auth.uid());
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.bookmarks') IS NOT NULL THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.mock_results') IS NOT NULL THEN
    ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "mock_results_select_own" ON public.mock_results;
    CREATE POLICY "mock_results_select_own" ON public.mock_results
      FOR SELECT USING (user_id = auth.uid());
    DROP POLICY IF EXISTS "mock_results_insert_own" ON public.mock_results;
    CREATE POLICY "mock_results_insert_own" ON public.mock_results
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.question_exposures') IS NOT NULL THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.questions') IS NOT NULL THEN
    ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "questions_read_public" ON public.questions;
    CREATE POLICY "questions_read_public" ON public.questions
      FOR SELECT USING (true);
  END IF;
END $$;

-- If the script ran without errors but a table is missing, create it from
-- supabase-schema.sql, then re-run this file.
