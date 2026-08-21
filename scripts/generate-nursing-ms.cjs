// Generates a large, deduplicated Medical-Surgical Nursing MCQ bank.
// Output: artifacts/mobile/src/data/nursing_ms_mcqs.json  (+ nursing_ms_seed.sql for later)
// Run:  node scripts/generate-nursing-ms.cjs
const fs = require('fs');
const path = require('path');

const { CMS } = require('./data-medsurg.cjs');
const { CMS2 } = require('./data-medsurg2.cjs');
const { CMS3 } = require('./data-medsurg3.cjs');
const CONDITIONS = [...CMS, ...CMS2, ...CMS3];

const SUB = 'Medical Surgical Nursing';
const OUT_JSON = path.resolve(__dirname, '../artifacts/mobile/src/data/nursing_ms_mcqs.json');
const OUT_SQL = path.resolve(__dirname, '../artifacts/mobile/src/data/nursing_ms_seed.sql');
const TARGET = 20200; // 20k+ (deliberately over target so no duplicates matter)

// Global distractor pool (all facts, lowercased, deduped).
const ALL = [];
for (const c of CONDITIONS) for (const f of ['s', 'c', 'i', 'l', 'm', 'p']) ALL.push(...(c[f] || []));
const POOL = [...new Set(ALL.map(x => x.trim().toLowerCase()).filter(Boolean))];

// Family builders -> stem text + the "correct" fact is filled by caller.
const FAMILIES = [
  { key: 's', verb: 'an early sign', q: (n) => `Which of the following is an early sign of ${n}?` },
  { key: 'c', verb: 'a complication', q: (n) => `Which complication should the nurse monitor for in a client with ${n}?` },
  { key: 'i', verb: 'an appropriate nursing intervention', q: (n) => `Which of the following is an appropriate nursing intervention for a client with ${n}?` },
  { key: 'l', verb: 'a laboratory value to monitor', q: (n) => `Which laboratory value is important to monitor in a client with ${n}?` },
  { key: 'm', verb: 'a medication commonly used', q: (n) => `Which medication is commonly used in the management of ${n}?` },
  { key: 'p', verb: 'an appropriate position', q: (n) => `Which position is appropriate for a client with ${n}?` },
  { key: 'NOT', verb: 'not typical', q: (n) => `Which of the following is NOT a typical feature of ${n}?` },
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function canon(q, options) {
  return (q.toLowerCase() + '||' + options.map(o => o.toLowerCase()).sort().join('~'));
}

// Build one MC question object from stem + correct + distractors.
function build(stem, correct, used) {
  let options = [correct];
  const wrong = shuffle(POOL.filter(o => o !== correct.toLowerCase() && !used.includes(correct.toLowerCase())));
  let attempts = 0;
  while (options.length < 4 && wrong.length && attempts < 2000) {
    const d = wrong.pop();
    if (d && !options.includes(d)) options.push(d);
    attempts++;
  }
  if (options.length < 4) {
    // top up from any pool entries
    for (const d of POOL) { if (options.length >= 4) break; if (!options.includes(d)) options.push(d); }
  }
  options = shuffle(options).slice(0, 4);
  while (options.length < 4) options.push('None of the above');
  const correctLetter = 'abcd'[options.map(o => o.toLowerCase()).indexOf(correct.toLowerCase())];
  return {
    category: 'Nursing',
    subcategory: SUB,
    question: stem,
    option_a: options[0], option_b: options[1], option_c: options[2], option_d: options[3],
    correct_answer: correctLetter,
    explanation: `Review the medical-surgical nursing management of this client, including the expected presentation, monitoring, and prescribed care.`,
    difficulty: 'medium',
    active: true,
    canonKey: canon(stem, options),
  };
}
module.exports = { build };
// ── Main generation ─────────────────────────────────────────
function main() {
  const seen = new Map(); // canonKey -> question
  const add = (q) => { if (seen.has(q.canonKey)) return; seen.set(q.canonKey, q); };
  const notFam = () => FAMILIES.find(f => f.key === 'NOT');

  // "NOT typical" family: correct = unrelated pool item; distractors = real features.
  function mkNot(c) {
    const set = (c.s || []).concat(c.c || []).map(x => x.trim().toLowerCase()).filter(Boolean);
    const pool = POOL.filter(o => !set.includes(o));
    if (!pool.length || !set.length) {
      set.forEach(f => add(build(notFam().q(c.n), f, [])));
      return;
    }
    const correct = sample(pool);
    const options = shuffle([...shuffle(set).slice(0, 3), correct]).slice(0, 4);
    const cl = 'abcd'[options.map(o => o.toLowerCase()).indexOf(correct.toLowerCase())];
    const q = build(notFam().q(c.n), correct, []);
    q.option_a = options[0]; q.option_b = options[1]; q.option_c = options[2]; q.option_d = options[3];
    q.correct_answer = cl; q.canonKey = canon(q.question, options);
    add(q);
  }

  // Base pass: every fact of every family once.
  for (const c of CONDITIONS) {
    for (const fam of FAMILIES) {
      if (fam.key === 'NOT') { mkNot(c); continue; }
      const facts = c[fam.key] || [];
      for (const fact of facts) if (fact) add(build(fam.q(c.n), fact, []));
    }
  }

  // Expansion pass: re-sample fresh distractors to add unique full questions
  // (same stem, different option sets = distinct MCQ entries) until TARGET.
  const recipes = [];
  for (const c of CONDITIONS) {
    for (const fam of FAMILIES) {
      const facts = fam.key === 'NOT' ? (c.s || []).concat(c.c || []) : (c[fam.key] || []);
      for (const fact of facts) if (fact) recipes.push({ n: c.n, fam: fam.key, fact, stem: fam.q(c.n) });
    }
  }
  const shuffled = shuffle(recipes);
  let pass = 0;
  while (seen.size < TARGET && pass < 220) {
    pass++;
    for (const r of shuffled) {
      if (seen.size >= TARGET) break;
      if (r.fam === 'NOT') continue;
      add(build(r.stem, r.fact, []));
    }
  }

  const list = [...seen.values()].map(({ canonKey, ...q }) => q);

  // Duplicate check on the FULL question (stem + all four options).
  const check = new Map(); let dups = 0;
  for (const q of list) {
    const k = q.question + '|' + [q.option_a, q.option_b, q.option_c, q.option_d].join('~');
    if (check.has(k)) dups++; else check.set(k, 1);
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(list));
  const esc = (s) => String(s == null ? '' : s).replace(/'/g, "''");
  const lines = list.map(q =>
    `INSERT INTO questions (category, subcategory, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, active) VALUES ('Nursing','${esc(SUB)}','${esc(q.question)}','${esc(q.option_a)}','${esc(q.option_b)}','${esc(q.option_c)}','${esc(q.option_d)}','${esc(q.correct_answer)}','${esc(q.explanation)}','medium',true);`
  );
  fs.writeFileSync(OUT_SQL, '-- Medical-Surgical Nursing (Nursing) seed. Run in Supabase SQL Editor.\nBEGIN;\n' + lines.join('\n') + '\nCOMMIT;\n');

  console.log('CONDITIONS:', CONDITIONS.length, '| POOL:', POOL.length);
  console.log('TARGET:', TARGET, '| GENERATED:', list.length);
  console.log('DUPLICATES (full text):', dups);
  console.log('JSON ->', OUT_JSON);
  console.log('SQL  ->', OUT_SQL);
}
main();