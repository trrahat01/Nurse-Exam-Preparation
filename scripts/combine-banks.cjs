// Combine all generated/migrated MCQ banks into one import-ready SQL bundle.
// Normalizes correct_answer to a letter, dedups by question text, and emits SQL.
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'artifacts', 'mobile', 'src', 'data');

const BANKS = [
  'bangla_wordlist_mcqs.json',
  'bangla_claude.json',
  'english_corpus.json',
  'nursing_bsc_rewritten.json',
];

function normAnswer(row) {
  // Return letter a-d regardless of whether row stores a letter or the option text.
  const map = { a: 'a', b: 'b', c: 'c', d: 'd' };
  const ca = (row.correct_answer || '').toString().trim();
  if (map[ca]) return ca;
  const opt = ["option_a", "option_b", "option_c", "option_d"];
  for (let i = 0; i < 4; i++) {
    if (row[opt[i]] != null && row[opt[i]].toString().trim() === ca) {
      return ['a', 'b', 'c', 'd'][i];
    }
  }
  return null;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/'/g, "''");
}

let all = [];
for (const file of BANKS) {
  const p = path.join(DATA, file);
  if (!fs.existsSync(p)) { console.error('MISSING', file); continue; }
  const rows = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const r of rows) {
    const letter = normAnswer(r);
    if (!letter) {
      console.error('SKIP (no valid answer):', file, r.question);
      continue;
    }
    all.push({ ...r, correct_answer: letter, _src: file });
  }
  console.log(`${file}: ${rows.length} -> kept`);
}

// Dedup by FULL content (question + options + correct_answer) = true duplicates only.
function contentKey(r){
  return [r.question, r.option_a, r.option_b, r.option_c, r.option_d, r.correct_answer]
    .map(x=>String(x==null?'':x).trim()).join('|');
}
const seen = new Map(); // key -> count
const dupExact = [];
for (const r of all) {
  const k = contentKey(r);
  if (seen.has(k)) {
    const c = seen.get(k);
    seen.set(k, c + 1);
    if (c === 1) dupExact.push(k); // report on 2nd occurrence
  } else {
    seen.set(k, 1);
  }
}
// Keep one of each exact-duplicate group; drop exact dups.
const kept = new Set();
const unique = [];
for (const r of all) {
  const k = contentKey(r);
  if (kept.has(k)) continue;
  kept.add(k);
  unique.push(r);
}
console.log('EXACT duplicates removed:', all.length - unique.length);
console.log('TOTAL unique (full-content):', unique.length);


// Build SQL
const lines = [];
lines.push('-- Combined MCQ import bundle (Bangla + English, generated/original content)');
lines.push('BEGIN;');
for (const r of unique) {
  const vals = [
    r.category, r.subcategory, r.exam_type || 'bpsc', r.subject, r.chapter,
    r.question, r.option_a, r.option_b, r.option_c, r.option_d, r.correct_answer,
    esc(r.explanation || ''), r.difficulty || 'medium', r.importance || 3, r.active === false ? 0 : 1,
  ].map((v) => `'${esc(v)}'`);
  lines.push(`INSERT INTO questions (category,subcategory,exam_type,subject,chapter,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,importance,active) VALUES (${vals.join(',')});`);
}
lines.push('COMMIT;');

const out = path.join(DATA, 'import_combined_bundle.sql');
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log('WROTE', out, lines.length - 3, 'INSERTs');
