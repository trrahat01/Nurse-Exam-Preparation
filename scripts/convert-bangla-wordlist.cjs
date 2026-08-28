// Convert bangla_wordlist_v1.csv into import-ready Bangla MCQs (JSON + SQL),
// deduping against the existing bangla_claude.json so we never create duplicates.
const fs = require('fs'), path = require('path');
const BASE = path.resolve(__dirname, '..');
const DATA = path.join(BASE, 'artifacts/mobile/src/data');

// ---- read wordlist csv (simple parse; fields have no commas/quotes issues) ----
const csvTxt = fs.readFileSync(path.join(BASE, 'Mcq data/bangla_wordlist_v1.csv'), 'utf8');
const lines = csvTxt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
lines.shift(); // header
const rows = lines.map(l => l.split(',').map(s => s.trim()));
const wl = rows.filter(r => r.length >= 3 && r[0]);

// ---- existing questions (dedup target) ----
let existing = [];
if (fs.existsSync(path.join(DATA, 'bangla_claude.json'))) {
  existing = JSON.parse(fs.readFileSync(path.join(DATA, 'bangla_claude.json'), 'utf8'));
}
const existingQ = new Set(existing.map(q => q.question));

// ---- build MCQ : correct answer + 3 real distractors from the same category pool
function buildMCQ(cat, term, answer) {
  // pool = all answers in this category, excluding the correct one -> real distractors
  const pool = wl.filter(r => r[0] === cat && r[2] !== answer).map(r => r[2]);
  // Also allow the correct answer itself; pick 3 unique distractors.
  let dist = pool.filter((v, i) => pool.indexOf(v) === i);
  // shuffle
  for (let i = dist.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [dist[i],dist[j]]=[dist[j],dist[i]]; }
  const chosen = dist.slice(0, 3);
  if (chosen.length < 3) return null;
  const opts = [answer, ...chosen];
  // shuffle options
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [opts[i],opts[j]]=[opts[j],opts[i]]; }
  const letters = ['a','b','c','d'];
  const sub = cat === 'synonym' ? 'Synonyms' : cat === 'antonym' ? 'Antonyms' : 'One Word';
  let question;
  if (cat === 'one_word') {
    question = `"${term}"-এর এককথায় প্রকাশ কী?`;
  } else if (cat === 'synonym') {
    question = `"${term}" শব্দের সমার্থক শব্দ কোনটি?`;
  } else {
    question = `"${term}" শব্দের বিপরীত শব্দ কোনটি?`;
  }
  return {
    category: 'Bangla', subcategory: sub, exam_type: 'bpsc', subject: 'Bangla', chapter: sub,
    question, option_a: opts[0], option_b: opts[1], option_c: opts[2], option_d: opts[3],
    correct_answer: letters[opts.indexOf(answer)],
    explanation: cat === 'synonym' ? `"${term}"-এর সমার্থক শব্দ "${answer}"।`
      : cat === 'antonym' ? `"${term}"-এর বিপরীত শব্দ "${answer}"।`
      : `"${term}"-এর এককথায় প্রকাশ "${answer}"।`,
    difficulty: 'easy', importance: 3, active: true,
  };
}

const out = [];
for (const [cat, term, answer] of wl) {
  const q = buildMCQ(cat, term, answer);
  if (!q) continue;
  if (existingQ.has(q.question)) continue; // skip dups
  out.push(q);
  existingQ.add(q.question);
}

const subCounts = {};
for (const q of out) subCounts[q.subcategory] = (subCounts[q.subcategory] || 0) + 1;
console.log('NEW MCQs:', out.length, JSON.stringify(subCounts));

// write JSON
fs.writeFileSync(path.join(DATA, 'bangla_wordlist_mcqs.json'), JSON.stringify(out, null, 2), 'utf8');

// ---- write import SQL (same schema as import_bangla_claude.sql) ----
const esc = s => String(s).replace(/'/g, "''");
let sql = `-- Bangla MCQs generated from bangla_wordlist_v1.csv (${out.length} rows)\nBEGIN;\n`;
for (const q of out) {
  sql += `INSERT INTO questions (category, subcategory, exam_type, subject, chapter, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, importance, active) VALUES ('${q.category}','${q.subcategory}','${q.exam_type}','${q.subject}','${q.chapter}','${esc(q.question)}','${esc(q.option_a)}','${esc(q.option_b)}','${esc(q.option_c)}','${esc(q.option_d)}','${q.correct_answer}','${esc(q.explanation)}','${q.difficulty}',${q.importance},true);\n`;
}
sql += 'COMMIT;\n';
fs.writeFileSync(path.join(DATA, 'import_bangla_wordlist.sql'), sql, 'utf8');
console.log('Wrote', path.join(DATA, 'bangla_wordlist_mcqs.json'), 'and import_bangla_wordlist.sql');
