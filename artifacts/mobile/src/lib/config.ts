// Backend config — Supabase database (local-first app; no accounts, no login).

// ---- Supabase Database ----
export const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDA5NjYsImV4cCI6MjEwMDM3Njk2Nn0.zKZOZWAPVuru__LbSvuyR836N9ZqMIFFakStrv-KEhk';
export const SUPABASE_TABLES = {
  questions: 'questions',
  results: 'results',
  bookmarks: 'bookmarks',
};