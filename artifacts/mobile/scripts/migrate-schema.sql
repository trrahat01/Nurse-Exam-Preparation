-- ============================================================
-- Fix seed-mcqs.sql to work with new schema
-- Run this AFTER running seed-mcqs.sql if it fails
-- ============================================================

-- First, drop and recreate the questions table with the correct schema
-- WARNING: This will delete any existing questions
DROP TABLE IF EXISTS questions CASCADE;

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
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

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_verified ON questions(verified);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);

-- Recreate RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (active = TRUE);
DROP POLICY IF EXISTS "Allow anon insert questions" ON questions;
CREATE POLICY "Allow anon insert questions" ON questions FOR INSERT TO anon WITH CHECK (true);

-- Now run seed-mcqs.sql - it should work with the updated categories INSERT