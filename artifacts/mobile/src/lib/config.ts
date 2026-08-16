// Backend config — Firebase Auth + Supabase DB.

// ---- Firebase Authentication (from google-services.json) ----
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB0EWGoV38hdPgKdovCsR2ZebYXzOmTbk4',
  authDomain: 'nurse-exam-cb96d.firebaseapp.com',
  projectId: 'nurse-exam-cb96d',
  storageBucket: 'nurse-exam-cb96d.firebasestorage.app',
  messagingSenderId: '1053263809544',
  appId: '1:1053263809544:android:b8b2144a291b2e515295bd',
};

// ---- Supabase Database ----
export const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDA5NjYsImV4cCI6MjEwMDM3Njk2Nn0.zKZOZWAPVuru__LbSvuyR836N9ZqMIFFakStrv-KEhk';
export const SUPABASE_TABLES = {
  questions: 'questions',
  results: 'results',
  bookmarks: 'bookmarks',
};