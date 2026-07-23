-- ============================================================
-- BPSC Nurse Exam Prep — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL UNIQUE,
  icon         TEXT,
  color        TEXT DEFAULT '#0891B2',
  bg_color     TEXT DEFAULT '#E0F2FE',
  description  TEXT,
  order_index  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBCATEGORIES (Chapters) ────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id    UUID REFERENCES categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  question_count INT DEFAULT 0,
  order_index    INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUESTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category       TEXT NOT NULL,
  subcategory    TEXT NOT NULL,
  question       TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  explanation    TEXT,
  difficulty     TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  reference      TEXT,
  active         BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_category    ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subcategory ON questions(subcategory);
CREATE INDEX IF NOT EXISTS idx_questions_active      ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty  ON questions(difficulty);

-- ─── MOCK RESULTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_results (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score       INT NOT NULL DEFAULT 0,
  correct     INT NOT NULL DEFAULT 0,
  wrong       INT NOT NULL DEFAULT 0,
  skipped     INT NOT NULL DEFAULT 0,
  percentage  NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_taken  INT NOT NULL DEFAULT 0,
  exam_type   TEXT NOT NULL DEFAULT 'mock',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_results_user_id ON mock_results(user_id);

-- ─── USER ANSWERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         UUID NOT NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT CHECK (selected_answer IN ('a','b','c','d')),
  correct_answer  TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_exam_id ON user_answers(exam_id);

-- ─── BOOKMARKS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

-- Questions: public read (all), no write from client
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read questions"  ON questions FOR SELECT USING (active = TRUE);

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);

-- Subcategories: public read
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (TRUE);

-- Mock results: users own their rows
ALTER TABLE mock_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own results" ON mock_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert results"   ON mock_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User answers: users own their rows
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own answers"   ON user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own answers" ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks: users own their rows
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookmarks"   ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ─── SAMPLE DATA (Optional — delete before production) ────────
-- Insert 4 main categories
INSERT INTO categories (name, icon, color, bg_color, description, order_index) VALUES
  ('Nursing',          'medical-bag',        '#0891B2', '#E0F2FE', 'Nursing Science & Clinical Practice', 1),
  ('Bangla',           'alphabetical',       '#7C3AED', '#EDE9FE', 'Bangla Language & Literature',        2),
  ('English',          'book-open-variant',  '#059669', '#D1FAE5', 'English Language & Grammar',          3),
  ('General Knowledge','earth',              '#D97706', '#FEF3C7', 'GK, Current Affairs & Bangladesh',    4)
ON CONFLICT (name) DO NOTHING;

-- ─── NOTES FOR ADMIN PANEL ────────────────────────────────────
-- To allow admin to manage questions, create a service-role policy or
-- use Supabase's built-in Table Editor with the service role key.
-- For the admin panel, use SUPABASE_SERVICE_ROLE_KEY (never expose to client).
