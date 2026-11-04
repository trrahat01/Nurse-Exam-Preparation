-- ============================================================
-- NursePrep BD - Complete Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#0891B2',
  bg_color TEXT DEFAULT '#E0F2FE',
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  question_count INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Types
CREATE TABLE IF NOT EXISTS exam_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  total_questions INT DEFAULT 100,
  time_minutes INT DEFAULT 60,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  question_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  subcategory TEXT,
  exam_type TEXT DEFAULT 'bpsc',
  subject TEXT,
  chapter TEXT,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  explanation TEXT,
  memory_tip TEXT,
  solution_step TEXT,
  formula TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  importance INT DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'english' CHECK (language IN ('english','bangla','mixed')),
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subcategory ON questions(subcategory);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_verified ON questions(verified);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_search ON questions USING GIN(to_tsvector('english', question));

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  exam_target TEXT,
  district TEXT,
  study_streak INT DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock Results
CREATE TABLE IF NOT EXISTS mock_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT DEFAULT 'mock',
  score INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  wrong INT NOT NULL DEFAULT 0,
  skipped INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_taken INT NOT NULL DEFAULT 0,
  total_questions INT DEFAULT 100,
  category_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_results_user_id ON mock_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_results_created ON mock_results(created_at DESC);

-- User Answers
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT CHECK (selected_answer IN ('a','b','c','d')),
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_exam_id ON user_answers(exam_id);

-- Question Exposures
CREATE TABLE IF NOT EXISTS question_exposures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  exam_type TEXT DEFAULT 'general',
  served_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_exposures_user_id ON question_exposures(user_id);
CREATE INDEX IF NOT EXISTS idx_question_exposures_question_id ON question_exposures(question_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- Wrong Answers
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_id ON wrong_answers(user_id);

-- Daily Practice
CREATE TABLE IF NOT EXISTS daily_practice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_answered INT DEFAULT 0,
  correct INT DEFAULT 0,
  wrong INT DEFAULT 0,
  streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_date)
);

-- Study Streaks
CREATE TABLE IF NOT EXISTS study_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_study_date DATE,
  total_study_days INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- User Performance
CREATE TABLE IF NOT EXISTS user_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_questions INT DEFAULT 0,
  correct INT DEFAULT 0,
  wrong INT DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Row Level Security

-- Questions: public read (active only), no write from client
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (active = TRUE);

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);

-- Subjects: public read
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read subjects" ON subjects;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (TRUE);

-- Subcategories: public read
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read subcategories" ON subcategories;
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (TRUE);

-- Chapters: public read
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read chapters" ON chapters;
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (TRUE);

-- Mock results: users own their rows
ALTER TABLE mock_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own results" ON mock_results;
DROP POLICY IF EXISTS "Users insert results" ON mock_results;
CREATE POLICY "Users read own results" ON mock_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert results" ON mock_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User answers: users own their rows
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own answers" ON user_answers;
DROP POLICY IF EXISTS "Users insert own answers" ON user_answers;
CREATE POLICY "Users read own answers" ON user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own answers" ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Question exposures: users own their rows
ALTER TABLE question_exposures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own question exposures" ON question_exposures;
DROP POLICY IF EXISTS "Users insert own question exposures" ON question_exposures;
DROP POLICY IF EXISTS "Users delete own question exposures" ON question_exposures;
CREATE POLICY "Users read own question exposures" ON question_exposures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own question exposures" ON question_exposures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own question exposures" ON question_exposures FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: users own their rows
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users delete own bookmarks" ON bookmarks;
CREATE POLICY "Users read own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Wrong answers: users own their rows
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own wrong answers" ON wrong_answers;
DROP POLICY IF EXISTS "Users insert own wrong answers" ON wrong_answers;
DROP POLICY IF EXISTS "Users update own wrong answers" ON wrong_answers;
DROP POLICY IF EXISTS "Users delete own wrong answers" ON wrong_answers;
CREATE POLICY "Users read own wrong answers" ON wrong_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wrong answers" ON wrong_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own wrong answers" ON wrong_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own wrong answers" ON wrong_answers FOR DELETE USING (auth.uid() = user_id);

-- Daily practice: users own their rows
ALTER TABLE daily_practice ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own daily practice" ON daily_practice;
DROP POLICY IF EXISTS "Users insert own daily practice" ON daily_practice;
DROP POLICY IF EXISTS "Users update own daily practice" ON daily_practice;
CREATE POLICY "Users read own daily practice" ON daily_practice FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own daily practice" ON daily_practice FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own daily practice" ON daily_practice FOR UPDATE USING (auth.uid() = user_id);

-- Study streaks: users own their rows
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own streaks" ON study_streaks;
DROP POLICY IF EXISTS "Users insert own streaks" ON study_streaks;
DROP POLICY IF EXISTS "Users update own streaks" ON study_streaks;
CREATE POLICY "Users read own streaks" ON study_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streaks" ON study_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streaks" ON study_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: users own their rows
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- User performance: users own their rows
ALTER TABLE user_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own performance" ON user_performance;
DROP POLICY IF EXISTS "Users insert own performance" ON user_performance;
DROP POLICY IF EXISTS "Users update own performance" ON user_performance;
CREATE POLICY "Users read own performance" ON user_performance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own performance" ON user_performance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own performance" ON user_performance FOR UPDATE USING (auth.uid() = user_id);

-- Seed core categories
INSERT INTO categories (name, slug, icon, color, bg_color, description, order_index) VALUES
  ('Nursing', 'nursing', 'medical-bag', '#0891B2', '#E0F2FE', 'Nursing Science & Clinical Practice', 1),
  ('Bangla', 'bangla', 'alphabetical', '#7C3AED', '#EDE9FE', 'Bangla Language & Literature', 2),
  ('English', 'english', 'book-open-variant', '#059669', '#D1FAE5', 'English Language & Grammar', 3),
  ('General Knowledge', 'general-knowledge', 'earth', '#D97706', '#FEF3C7', 'GK, Current Affairs & Bangladesh', 4)
ON CONFLICT (name) DO NOTHING;

-- Seed exam types
INSERT INTO exam_types (name, slug, description, total_questions, time_minutes) VALUES
  ('Mock Test', 'mock', 'Full-length simulated government exam', 100, 60),
  ('Daily Practice', 'daily', 'Short daily practice session', 20, 20),
  ('Subject Practice', 'subject', 'Practice by subject/chapter', 20, 20)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Atomic Question Delivery & Distribution RPC Function
-- Implements Iterative Inventory-Constrained Largest Remainder Method (LRM)
-- Nursing: 60%, General Knowledge: 15%, English: 15%, Bangla: 10%
-- ============================================================

CREATE OR REPLACE FUNCTION fetch_unseen_questions_distributed(
  p_total_count INT,
  p_category TEXT DEFAULT NULL,
  p_subcategory TEXT DEFAULT NULL,
  p_exam_type TEXT DEFAULT 'practice'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_delivered_questions JSONB := '[]'::jsonb;
  v_requested_count INT := p_total_count;
  v_delivered_count INT := 0;
  v_status TEXT;
  v_category_stats JSONB := '{}'::jsonb;
  v_categories TEXT[] := ARRAY['Nursing', 'General Knowledge', 'English', 'Bangla'];
  v_base_weights NUMERIC[] := ARRAY[0.60, 0.15, 0.15, 0.10];
  v_weights NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
  v_avail INT[] := ARRAY[0, 0, 0, 0];
  v_quota INT[] := ARRAY[0, 0, 0, 0];
  v_total_avail INT := 0;
  v_weight_sum NUMERIC := 0.0;
  
  -- Iteration variables for LRM
  v_remaining INT;
  v_iter INT;
  v_active_count INT;
  v_weight_active_sum NUMERIC;
  v_target INT;
  v_sum_target INT;
  v_diff INT;
  v_remainders NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
  v_alloc_add INT[] := ARRAY[0, 0, 0, 0];
  v_max_rem NUMERIC;
  v_max_idx INT;
  
  v_cat_name TEXT;
  v_cat_requested INT;
  v_delivered_for_cat INT;
  v_i INT;
  v_selected_ids UUID[] := ARRAY[]::UUID[];
  v_inserted_ids UUID[] := ARRAY[]::UUID[];
  v_cat_selected UUID[];
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Unauthorized',
      'requested_count', v_requested_count,
      'delivered_count', 0,
      'category_stats', '{}'::jsonb,
      'questions', '[]'::jsonb
    );
  END IF;

  -- Atomic transactional advisory lock per user to prevent concurrent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text));

  -- Validate exam type strictly
  IF p_exam_type NOT IN ('mock', 'daily_20', 'daily_50', 'daily_100', 'challenge', 'practice') THEN
    RAISE EXCEPTION 'Invalid exam_type: %. Must be one of mock, daily_20, daily_50, daily_100, challenge, practice.', p_exam_type;
  END IF;

  IF v_requested_count <= 0 THEN
    RETURN jsonb_build_object(
      'status', 'insufficient',
      'requested_count', v_requested_count,
      'delivered_count', 0,
      'category_stats', '{}'::jsonb,
      'questions', '[]'::jsonb
    );
  END IF;

  -- 1. Determine available unseen inventory per category with filters
  FOR v_i IN 1..4 LOOP
    SELECT COUNT(*)::INT INTO v_avail[v_i]
    FROM public.questions q
    WHERE q.active = true 
      AND q.category = v_categories[v_i]
      AND (p_category IS NULL OR q.category = p_category)
      AND (p_subcategory IS NULL OR q.subcategory = p_subcategory)
      AND NOT EXISTS (
        SELECT 1 FROM public.question_exposures e
        WHERE e.user_id = v_user_id AND e.question_id = q.id
      );
    v_total_avail := v_total_avail + v_avail[v_i];
  END LOOP;

  -- 2. Determine effective weights with subcategory/category normalization
  IF p_category IS NOT NULL THEN
    FOR v_i IN 1..4 LOOP
      IF v_categories[v_i] = p_category THEN
        v_weights[v_i] := 1.0;
      ELSE
        v_weights[v_i] := 0.0;
      END IF;
    END LOOP;
  ELSE
    -- p_category IS NULL (may have p_subcategory or neither)
    v_weight_sum := 0.0;
    FOR v_i IN 1..4 LOOP
      IF v_avail[v_i] > 0 THEN
        v_weights[v_i] := v_base_weights[v_i];
        v_weight_sum := v_weight_sum + v_base_weights[v_i];
      ELSE
        v_weights[v_i] := 0.0;
      END IF;
    END LOOP;
    
    -- Normalize weights if some categories have zero available inventory
    IF v_weight_sum > 0 THEN
      FOR v_i IN 1..4 LOOP
        v_weights[v_i] := v_weights[v_i] / v_weight_sum;
      END LOOP;
    END IF;
  END IF;

  -- 3. Genuine Iterative Inventory-Constrained Largest Remainder Method (LRM)
  v_remaining := LEAST(v_requested_count, v_total_avail);
  
  -- Iterative allocation loop (up to 10 iterations to ensure convergence)
  FOR v_iter IN 1..10 LOOP
    IF v_remaining <= 0 THEN
      EXIT;
    END IF;

    -- Count active categories that can still take more inventory
    v_active_count := 0;
    v_weight_active_sum := 0.0;
    FOR v_i IN 1..4 LOOP
      IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
        v_active_count := v_active_count + 1;
        v_weight_active_sum := v_weight_active_sum + v_weights[v_i];
      END IF;
    END LOOP;

    IF v_active_count = 0 OR v_weight_active_sum <= 0 THEN
      EXIT;
    END IF;

    -- Calculate provisional shares for this iteration
    v_sum_target := 0;
    FOR v_i IN 1..4 LOOP
      IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
        DECLARE
          v_norm_w NUMERIC := v_weights[v_i] / v_weight_active_sum;
          v_share NUMERIC := v_remaining * v_norm_w;
        BEGIN
          v_target := floor(v_share)::INT;
          v_target := LEAST(v_target, v_avail[v_i] - v_quota[v_i]);
          v_alloc_add[v_i] := v_target;
          v_remainders[v_i] := v_share - v_target;
          v_sum_target := v_sum_target + v_target;
        END;
      ELSE
        v_alloc_add[v_i] := 0;
        v_remainders[v_i] := 0.0;
      END IF;
    END LOOP;

    v_diff := v_remaining - v_sum_target;

    -- Distribute remaining diff slots one by one using largest remainder with priority tie-breaking (1: Nursing > 2: GK > 3: English > 4: Bangla)
    WHILE v_diff > 0 LOOP
      v_max_rem := -1.0;
      v_max_idx := -1;
      
      FOR v_i IN 1..4 LOOP
        IF (v_avail[v_i] - v_quota[v_i] - v_alloc_add[v_i]) > 0 AND v_weights[v_i] > 0 THEN
          IF v_remainders[v_i] > v_max_rem THEN
            v_max_rem := v_remainders[v_i];
            v_max_idx := v_i;
          END IF;
        END IF;
      END LOOP;

      IF v_max_idx != -1 THEN
        v_alloc_add[v_max_idx] := v_alloc_add[v_max_idx] + 1;
        v_remainders[v_max_idx] := -1.0; -- prevent reuse in this round
        v_diff := v_diff - 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;

    -- Apply allocations from this iteration to quotas
    DECLARE
      v_progress INT := 0;
    BEGIN
      FOR v_i IN 1..4 LOOP
        v_quota[v_i] := v_quota[v_i] + v_alloc_add[v_i];
        v_progress := v_progress + v_alloc_add[v_i];
      END LOOP;
      
      IF v_progress = 0 THEN
        EXIT;
      END IF;
      
      v_remaining := v_remaining - v_progress;
    END;
  END LOOP;

  -- 4. Fetch question IDs per quota from unseen active inventory
  v_selected_ids := ARRAY[]::UUID[];
  FOR v_i IN 1..4 LOOP
    IF v_quota[v_i] > 0 THEN
      SELECT ARRAY_AGG(sub.id) INTO v_cat_selected
      FROM (
        SELECT q.id FROM public.questions q
        WHERE q.active = true AND q.category = v_categories[v_i]
          AND (p_category IS NULL OR q.category = p_category)
          AND (p_subcategory IS NULL OR q.subcategory = p_subcategory)
          AND NOT EXISTS (
            SELECT 1 FROM public.question_exposures e
            WHERE e.user_id = v_user_id AND e.question_id = q.id
          )
        ORDER BY q.importance DESC, RANDOM()
        LIMIT v_quota[v_i]
      ) sub;
      IF v_cat_selected IS NOT NULL THEN
        v_selected_ids := v_selected_ids || v_cat_selected;
      END IF;
    END IF;
  END LOOP;

  -- 5. Atomic exposure recording & question payload construction
  IF array_length(v_selected_ids, 1) > 0 THEN
    WITH inserted AS (
      INSERT INTO public.question_exposures (user_id, question_id, exam_type, served_at)
      SELECT v_user_id, unnest(v_selected_ids), p_exam_type, NOW()
      ON CONFLICT (user_id, question_id) DO NOTHING
      RETURNING question_id
    )
    SELECT
      COALESCE(JSONB_AGG(to_jsonb(q)), '[]'::jsonb),
      COUNT(*)::INT,
      COALESCE(ARRAY_AGG(q.id), ARRAY[]::UUID[])
    INTO v_delivered_questions, v_delivered_count, v_inserted_ids
    FROM public.questions q
    JOIN inserted i ON q.id = i.question_id;
  END IF;

  IF v_delivered_count = v_requested_count THEN
    v_status := 'complete';
  ELSIF v_delivered_count > 0 THEN
    v_status := 'partial';
  ELSE
    v_status := 'insufficient';
  END IF;

  -- Calculate category statistics directly from actual inserted exposure rows joined to questions
  v_category_stats := '{}'::jsonb;
  FOR v_i IN 1..4 LOOP
    v_cat_name := v_categories[v_i];
    v_cat_requested := v_quota[v_i];

    IF array_length(v_inserted_ids, 1) > 0 THEN
      SELECT COUNT(*)::INT INTO v_delivered_for_cat
      FROM questions q
      WHERE q.category = v_cat_name
        AND q.id = ANY(v_inserted_ids);
    ELSE
      v_delivered_for_cat := 0;
    END IF;

    v_category_stats := jsonb_set(
      v_category_stats,
      ARRAY[v_cat_name],
      jsonb_build_object(
        'requested', v_cat_requested,
        'delivered', v_delivered_for_cat
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'status', v_status,
    'requested_count', v_requested_count,
    'delivered_count', v_delivered_count,
    'category_stats', v_category_stats,
    'questions', v_delivered_questions
  );
END;
$$;

-- Function Permissions
REVOKE ALL ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) TO service_role;
