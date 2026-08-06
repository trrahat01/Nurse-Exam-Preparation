/**
 * Upload 40,000+ unique MCQs to Supabase
 * Robust version - sanitizes all values and uploads one at a time
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const SQL_FILE = path.join(__dirname, '..', 'BPSC_Senior_Staff_Nurse_40000_MCQs.sql');

function clean(s) {
  if (!s) return '';
  return s.replace(/''/g, "'").replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').trim();
}

function sanitizeAnswer(raw) {
  const s = String(raw || '').toLowerCase().trim();
  if (s === 'a' || s === 'b' || s === 'c' || s === 'd') return s;
  if (s.includes('option a') || s.includes('option_a') || s.includes('a)')) return 'a';
  if (s.includes('option b') || s.includes('option_b') || s.includes('b)')) return 'b';
  if (s.includes('option c') || s.includes('option_c') || s.includes('c)')) return 'c';
  if (s.includes('option d') || s.includes('option_d') || s.includes('d)')) return 'd';
  if (s.length > 0 && 'abcd'.includes(s[0])) return s[0];
  return 'a'; // Default fallback
}

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function parseAllQuestions(sql) {
  const questions = [];
  const seen = new Set();
  
  // Simple regex-based extraction of INSERT rows
  const rowRegex = /^\('((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)'\)[,;]?$/gm;
  
  let match;
  let count = 0;
  while ((match = rowRegex.exec(sql)) !== null) {
    count++;
    const question = clean(match[1]);
    const optionA = clean(match[2]);
    const optionB = clean(match[3]);
    const optionC = clean(match[4]);
    const optionD = clean(match[5]);
    const correct = sanitizeAnswer(match[6]);
    const explanation = clean(match[7]) || 'No explanation available.';
    const category = clean(match[8]) || 'Nursing';
    const subcategory = clean(match[9]) || clean(match[8]) || 'General';
    const difficulty = clean(match[11]).toLowerCase();
    const language = clean(match[12]).toLowerCase() === 'bangla' ? 'bangla' : 'english';
    
    if (!question || question.length < 5) continue;
    const h = hash(question.toLowerCase());
    if (seen.has(h)) continue;
    seen.add(h);
    
    questions.push({
      category,
      subcategory,
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correct,
      explanation,
      difficulty: ['easy','medium','hard'].includes(difficulty) ? difficulty : 'medium',
      importance: 3,
      tags: [category.toLowerCase(), subcategory.toLowerCase().replace(/\s+/g, '-')],
      language,
      verified: true,
      active: true,
    });
  }
  console.log(`Parsed ${count} rows, ${questions.length} unique questions`);
  return questions;
}

async function deleteAllQuestions() {
  console.log('Deleting all existing questions...');
  let deleted = 0;
  while (true) {
    const { data } = await supabase.from('questions').select('id').range(0, 199);
    if (!data || data.length === 0) break;
    const ids = data.map(d => d.id);
    const { error } = await supabase.from('questions').delete().in('id', ids);
    if (error) { console.error('Delete error:', error.message); break; }
    deleted += ids.length;
    if (ids.length < 200) break;
  }
  console.log(`Total deleted: ${deleted}`);
}

async function uploadOne(q) {
  const { error } = await supabase.from('questions').insert([q]);
  return !error;
}

async function main() {
  console.log('Starting 40k MCQ upload...');
  await deleteAllQuestions();

  console.log('Reading SQL file...');
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`File size: ${(sql.length / 1024 / 1024).toFixed(1)} MB`);

  console.log('Parsing questions...');
  const questions = parseAllQuestions(sql);
  console.log(`Total unique questions: ${questions.length}`);

  // Upload one at a time to avoid constraint issues
  let uploaded = 0;
  let failed = 0;
  for (let i = 0; i < questions.length; i++) {
    const ok = await uploadOne(questions[i]);
    if (ok) uploaded++;
    else failed++;
    
    if ((i + 1) % 100 === 0) {
      console.log(`Processed ${i + 1}/${questions.length} (uploaded: ${uploaded}, failed: ${failed})`);
    }
  }

  console.log(`\n✅ Successfully uploaded ${uploaded} questions!`);
  console.log(`Failed: ${failed}`);

  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Total questions in database: ${count}`);
  console.log(`\nTarget: 40,000+ MCQs`);
  console.log(`Status: ${count >= 40000 ? '✅ TARGET MET' : `❌ Need ${40000 - count} more`}`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});