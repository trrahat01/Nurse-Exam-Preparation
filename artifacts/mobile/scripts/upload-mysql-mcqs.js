/**
 * Upload MySQL-format MCQs (40k questions) to Supabase
 * Usage: node scripts/upload-mysql-mcqs.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient('https://kdlqsxxzozjjaflwoylp.supabase.co', KEY);

const BATCH = 100;
const SQL_FILE = path.join(__dirname, '..', 'BPSC_Senior_Staff_Nurse_40000_MCQs.sql');

const diffMap = { 'Easy': 'easy', 'Medium': 'medium', 'Hard': 'hard' };

function unescape(s) {
  if (!s) return '';
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').trim();
}

function parse() {
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  const rows = [];
  let i = 0;
  
  while (i < sql.length) {
    // Find next INSERT
    const ins = sql.indexOf("INSERT INTO mcqs", i);
    if (ins === -1) break;
    
    // Find VALUES
    const vals = sql.indexOf("VALUES", ins);
    if (vals === -1) { i = ins + 15; continue; }
    
    let j = vals + 6;
    // Skip to first paren
    while (j < sql.length && sql[j] !== '(') j++;
    if (j >= sql.length) break;
    
    // Parse rows until we hit a ");" followed by next INSERT or end
    while (j < sql.length) {
      // Skip whitespace
      while (j < sql.length && sql[j] !== '(') j++;
      if (j >= sql.length) break;
      
      j++; // skip '('
      let depth = 1;
      let inStr = false;
      let strChar = '';
      let rowStart = j;
      
      while (j < sql.length && depth > 0) {
        const c = sql[j];
        
        if (inStr) {
          if (c === strChar && sql[j-1] !== '\\') inStr = false;
          j++;
          continue;
        }
        
        if (c === "'" || c === '"') { inStr = true; strChar = c; j++; continue; }
        if (c === '(') { depth++; j++; continue; }
        if (c === ')') { depth--; j++; continue; }
        j++;
      }
      
      const rowStr = sql.substring(rowStart, j - 1);
      
      // Parse comma-separated values from row
      const vals2 = [];
      let field = '';
      let fInStr = false;
      let fChar = '';
      
      for (let k = 0; k < rowStr.length; k++) {
        const c = rowStr[k];
        
        if (fInStr) {
          if (c === fChar && rowStr[k-1] !== '\\') {
            fInStr = false;
            vals2.push(field);
            field = '';
          } else {
            field += c;
          }
          continue;
        }
        
        if (c === "'" || c === '"') { fInStr = true; fChar = c; continue; }
        if (c === ',') {
          if (field.trim()) vals2.push(field.trim());
          field = '';
          continue;
        }
        field += c;
      }
      if (field.trim()) vals2.push(field.trim());
      
      if (vals2.length >= 12) {
        const ans = unescape(vals2[5]).toLowerCase().charAt(0);
        if (ans === 'a' || ans === 'b' || ans === 'c' || ans === 'd') {
          rows.push({
            category: unescape(vals2[7]) || 'Nursing',
            subcategory: unescape(vals2[8]) || unescape(vals2[7]) || 'General',
            question: unescape(vals2[0]),
            option_a: unescape(vals2[1]),
            option_b: unescape(vals2[2]),
            option_c: unescape(vals2[3]),
            option_d: unescape(vals2[4]),
            correct_answer: ans,
            explanation: unescape(vals2[6]) || 'No explanation.',
            difficulty: diffMap[unescape(vals2[10])] || 'medium',
            active: true
          });
        }
      }
      
      // Check if next char is ) or if next non-space is (
      while (j < sql.length && (sql[j] === ')' || sql[j] === ' ' || sql[j] === '\n' || sql[j] === '\r' || sql[j] === '\t')) {
        if (sql[j] === ')') { j = sql.length + 1; break; }
        j++;
      }
      
      // Check if this block is ended by a ");" followed by something that isn't a comma or (
      if (j >= sql.length) break;
      
      // Check next non-space chars
      let k = j;
      while (k < sql.length && (sql[k] === ' ' || sql[k] === '\n' || sql[k] === '\r' || sql[k] === '\t')) k++;
      if (k >= sql.length || sql[k] !== '(') break;
      j = k;
    }
    
    i = j >= sql.length ? sql.length : j;
  }
  
  return rows;
}

async function upload() {
  console.log('Parsing MySQL file...');
  const questions = parse();
  console.log(`Parsed ${questions.length} questions`);
  
  if (questions.length === 0) { console.error('No questions!'); return; }
  
  let inserted = 0;
  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);
    const { error } = await supabase.from('questions').insert(batch);
    if (error) {
      for (const q of batch) {
        const { error: e } = await supabase.from('questions').insert([q]);
        if (!e) inserted++;
      }
    } else inserted += batch.length;
    if (i % (BATCH * 5) === 0) console.log(`Progress: ${inserted}/${questions.length}`);
  }
  
  console.log(`\n✅ Uploaded ${inserted} questions`);
  const { count } = await supabase.from('questions').select('*', {count:'exact',head:true});
  console.log(`Total in DB: ${count}`);
}

upload().catch(console.error);