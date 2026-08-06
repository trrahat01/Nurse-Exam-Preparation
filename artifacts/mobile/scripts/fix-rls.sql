-- ============================================================
-- Fix RLS Policy to allow inserting questions
-- Run this in Supabase SQL Editor first, then run seed.js
-- ============================================================

-- Option 1: Allow inserts from anon key (for development)
DROP POLICY IF EXISTS "Allow anon insert questions" ON questions;
CREATE POLICY "Allow anon insert questions" ON questions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Option 2: Keep existing read policy
DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions
  FOR SELECT USING (active = TRUE);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'questions';