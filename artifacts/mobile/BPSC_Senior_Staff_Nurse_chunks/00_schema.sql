-- ============================================================
-- FINAL FIX - Run this FIRST, then run batch_*.sql
-- This creates the exact schema that the batch files expect
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS questions CASCADE;

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL DEFAULT '',
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
  importance INT DEFAULT 3,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'english' CHECK (language IN ('english','bangla','mixed')),
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subcategory ON questions(subcategory);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (active = TRUE);
DROP POLICY IF EXISTS "Allow anon insert questions" ON questions;
CREATE POLICY "Allow anon insert questions" ON questions FOR INSERT TO anon WITH CHECK (true);

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'questions' ORDER BY ordinal_position;