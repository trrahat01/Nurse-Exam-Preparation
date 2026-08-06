/**
 * Upload ALL MCQs from 40k SQL file to Supabase
 * Handles multi-line INSERT blocks properly
 * Usage: node scripts/upload-all-mcqs.js
 * This will take a while - let it run
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient('https://kdlqsxxzozjjaflwoylp.supabase.co', KEY);

const BATCH = 100;
const SQL_FILE = path.join(__dirname, '..', 'BPSC_Senior_Staff_Nurse_40000_MCQs.sql');
const PROGRESS_FILE = path.join(__dirname, '..', 'upload_progress.json');

const diffMap = { 'Easy': 'easy', 'Medium': 'medium', 'Hard': 'hard' };

function clean(s) {
  if (!s) return '';
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').trim();
}

function parseRows(valuesText) {
  const rows = [];
  let i = 0;
  
  while (i < valuesText.length) {
    // Skip to next opening paren
    while (i < valuesText.length && valuesText[i] !== '(') i++;
    if (i >= valuesText.length) break;
    i++; // skip '('
    
    // Collect until matching closing paren
    let depth = 1;
    let inStr = false;
    let strChar = '';
    let rowChars = [];
    
    while (i < valuesText.length && depth > 0) {
      const c = valuesText[i];
      
      if (inStr) {
        if (c === strChar && valuesText[i-1] !== '\\') inStr = false;
        rowChars.push(c);
        i++;
        continue;
      }
      
      if (c === "'" || c === '"') {
        inStr = true;
        strChar = c;
        rowChars.push(c);
        i++;
        continue;
      }
      
      if (c === '(') { depth++; rowChars.push(c); i++; continue; }
      if (c === ')') { depth--; if (depth > 0) rowChars.push(c); i++; continue; }
      rowChars.push(c);
      i++;
    }
    
    const rowStr = rowChars.join('');
    
    // Parse the row values
    const vals = [];
    let field = '';
    let fInStr = false;
    let fChar = '';
    
    for (let k = 0; k < rowStr.length; k++) {
      const c = rowStr[k];
      
      if (fInStr) {
        if (c === fChar && rowStr[k-1] !== '\\') {
          fInStr = false;
          vals.push(field);
          field = '';
        } else {
          field += c;
        }
        continue;
      }
      
      if (c === "'" || c === '"') { fInStr = true; fChar = c; continue; }
      if (c === ',') {
        vals.push(field.trim());
        field = '';
        continue;
      }
      field += c;
    }
    if (field.trim()) vals.push(field.trim());
    
    if (vals.length >= 12) {
      const ans = clean(vals[5]).toLowerCase().charAt(0);
      if (ans === 'a' || ans === 'b' || ans === 'c' || ans === 'd') {
        rows.push({
          category: clean(vals[7]) || 'Nursing',
          subcategory: clean(vals[8]) || clean(vals[7]) || 'General',
          question: clean(vals[0]),
          option_a: clean(vals[1]),
          option_b: clean(vals[2]),
          option_c: clean(vals[3]),
          option_d: clean(vals[4]),
          correct_answer: ans,
          explanation: clean(vals[6]) || 'No explanation.',
          difficulty: diffMap[clean(vals[10])] || 'medium',
          active: true
        });
      }
    }
  }
  
  return rows;
}

function extractInsertBlocks(sql) {
  const blocks = [];
  let i = 0;
  
  while (i < sql.length) {
    const insIdx = sql.indexOf('INSERT INTO mcqs', i);
    if (insIdx === -1) break;
    
    // Find VALUES
    const valIdx = sql.indexOf('VALUES', insIdx);
    if (valIdx === -1) { i = insIdx + 15; continue; }
    
    // Now find the end of this block
    // The block ends at the next INSERT INTO or end of file
    const nextIns = sql.indexOf('INSERT INTO mcqs', valIdx + 6);
    
    // Extract the values part
    let valuesEnd;
    if (nextIns === -1) {
      valuesEnd = sql.length;
    } else {
      // Find the ");" that ends this block (before next INSERT)
      // The last ");" before nextIns
      let searchEnd = nextIns;
      // Step back from nextIns to find the closing ");"
      let semiPos = sql.lastIndexOf(';', nextIns);
      if (semiPos > valIdx) {
        valuesEnd = semiPos + 1;
      } else {
        valuesEnd = nextIns;
      }
    }
    
    const blockText = sql.substring(valIdx + 6, valuesEnd).trim();
    blocks.push(blockText);
    
    i = valuesEnd;
  }
  
  return blocks;
}

async function upload() {
  console.log('Reading SQL file...');
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`File size: ${(sql.length / 1024 / 1024).toFixed(1)} MB`);
  
  // Extract all INSERT blocks
  console.log('Extracting INSERT blocks...');
  const blocks = extractInsertBlocks(sql);
  console.log(`Found ${blocks.length} INSERT blocks`);
  
  // Load progress
  let allQuestions = [];
  let processed = 0;
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const prog = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      processed = prog.processed || 0;
      console.log(`Resuming from block ${processed}`);
    } catch {}
  }
  
  // Process blocks
  for (let b = processed; b < blocks.length; b++) {
    const block = blocks[b];
    
    // Parse each block individually
    // The block contains multiple rows like (val1,val2,...),(val3,val4,...)
    const rows = parseRows(block);
    
    if (rows.length > 0) {
      allQuestions.push(...rows);
      
      // Upload when we have enough or at end
      if (allQuestions.length >= BATCH) {
        await flushQuestions(allQuestions);
        allQuestions = [];
      }
    }
    
    // Save progress every 5 blocks
    if ((b + 1) % 5 === 0 || b === blocks.length - 1) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ processed: b + 1 }));
      console.log(`Processed block ${b + 1}/${blocks.length}`);
    }
  }
  
  // Flush remaining
  if (allQuestions.length > 0) {
    await flushQuestions(allQuestions);
  }
  
  // Done
  fs.unlinkSync(PROGRESS_FILE);
  const { count } = await supabase.from('questions').select('*', {count:'exact',head:true});
  console.log(`\n✅ COMPLETE! Total questions in database: ${count}`);
}

async function flushQuestions(questions) {
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
  }
  console.log(`Uploaded ${inserted} questions (${questions.length} in batch)`);
}

upload().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});