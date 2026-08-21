// Nursing Procedures MCQ generator (templated, deduplicated).
// Run: node scripts/generate-procedures.cjs
const fs = require('fs');
const path = require('path');
const { PROCEDURES } = require('./procedures-data.cjs');

const CATEGORY = 'Nursing';
const SUBCAT = 'Nursing Procedures';

const FIELDS = [
  ['purpose', 'What is the primary purpose of {p}?'],
  ['equip', 'Which equipment is needed for {p}?'],
  ['steps', 'Which is a correct step when performing {p}?'],
  ['comps', 'Which is a potential complication of {p}?'],
  ['cons', 'Which nursing consideration is important during {p}?'],
];
const NOT_Q = {
  purpose: 'Which of the following is NOT a purpose of {p}?',
  equip: 'Which item is NOT needed for {p}?',
  steps: 'Which of the following is NOT a correct step in {p}?',
  comps: 'Which of the following is NOT a complication of {p}?',
  cons: 'Which of the following is NOT a nursing consideration for {p}?',
};

// Global pools of distractors per field.
const pools = { purpose: [], equip: [], steps: [], comps: [], cons: [], pos: [] };
for (const p of PROCEDURES) for (const k of Object.keys(pools)) for (const it of (p[k] || [])) pools[k].push(it);

function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function sample(arr, n, exclude = []) {
  const pool = arr.filter(x => !exclude.includes(x));
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

const seen = new Set();
const qs = [];
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

function build(text, correct, distractors) {
  const key = norm(text);
  if (seen.has(key)) return;
  seen.add(key);
  let opts = shuffle([correct, ...sample(distractors, 3, [correct])]).slice(0, 4);
  if (!opts.includes(correct)) { opts[0] = correct; opts.sort(() => Math.random() - 0.5); }
  const letters = ['a', 'b', 'c', 'd'];
  const order = shuffle(letters);
  const map = {};
  order.forEach((l, i) => { map[l] = opts[i] || ''; });
  const ci = opts.indexOf(correct);
  qs.push({
    category: CATEGORY, subcategory: SUBCAT, exam_type: 'bpsc',
    question: text,
    option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d,
    correct_answer: order[ci >= 0 ? ci : 0],
    explanation: `For the ${SUBCAT} topic, the correct response is: "${correct}".`,
    difficulty: 'medium', importance: 3, active: true,
  });
}

for (const p of PROCEDURES) {
  const name = p.name;
  // Positive + NOT questions for each multi-choice field
  for (const [field, template] of FIELDS) {
    const items = p[field] || [];
    for (const it of items) build(template.replace('{p}', name), it, pools[field]);
    for (const it of items) build(NOT_Q[field].replace('{p}', name), sample(pools[field], 1, items)[0] || it, items);
  }
  // Position questions
  if (p.pos) {
    build(`Which position is best for a patient during ${name}?`, p.pos, pools.pos);
    build(`Which position should be AVOIDED for a patient during ${name}?`, sample(pools.pos, 1, [p.pos])[0] || 'supine', [p.pos]);
  }
}

// Output JSON (for Supabase later) + SQL (INSERTs into `questions`)
const jsonPath = path.resolve(__dirname, '..', 'artifacts', 'mobile', 'procedures-nursing.json');
fs.writeFileSync(jsonPath, JSON.stringify(qs));
let sql = `INSERT INTO questions (category, subcategory, exam_type, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, importance, active) VALUES\n`;
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
const rows = qs.map(q => `(${['category','subcategory','exam_type','question','option_a','option_b','option_c','option_d','correct_answer','explanation','difficulty','importance','active'].map(k => `'${esc(q[k])}'`).join(',')})`);
sql += rows.join(',\n') + ';';
fs.writeFileSync(path.resolve(__dirname, '..', 'artifacts', 'mobile', 'procedures-nursing.sql'), sql);

console.log('Generated unique MCQs:', qs.length, '->', jsonPath);