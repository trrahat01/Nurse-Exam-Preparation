// Generates a large, deduplicated Emergency Nursing MCQ bank under Nursing.
// Output: artifacts/mobile/src/data/emergency_mcqs.json + emergency_seed.sql
const fs = require('fs');
const path = require('path');

const { EMERGENCY } = require('./data-emergency.cjs');
const CONDITIONS = EMERGENCY;
const SUB = 'Emergency';
const OUT_JSON = path.resolve(__dirname, '../artifacts/mobile/src/data/emergency_mcqs.json');
const OUT_SQL = path.resolve(__dirname, '../artifacts/mobile/src/data/emergency_seed.sql');
const TARGET = 20200;

const ALL = [];
for (const c of CONDITIONS) for (const f of ['s', 'c', 'i', 'l', 'm', 'p']) ALL.push(...(c[f] || []));
const POOL = [...new Set(ALL.map(x => x.trim().toLowerCase()).filter(Boolean))];

const FAMILIES = [
  { key: 's', q: (n) => `Which of the following is a characteristic of ${n}?` },
  { key: 'c', q: (n) => `Which risk or complication is associated with ${n}?` },
  { key: 'i', q: (n) => `Which emergency nursing intervention applies to ${n}?` },
  { key: 'l', q: (n) => `Which indicator should be monitored in ${n}?` },
  { key: 'm', q: (n) => `Which statement about ${n} is correct?` },
  { key: 'p', q: (n) => `Which preventive measure applies to ${n}?` },
  { key: 'NOT', q: (n) => `Which of the following is NOT associated with ${n}?` },
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function canon(q, options) { return (q.toLowerCase() + '||' + options.map(o => o.toLowerCase()).sort().join('~')); }

function build(stem, correct) {
  let options = [correct];
  const wrong = shuffle(POOL.filter(o => o !== correct.toLowerCase()));
  let attempts = 0;
  while (options.length < 4 && wrong.length && attempts < 3000) {
    const d = wrong.pop();
    if (d && !options.includes(d)) options.push(d);
    attempts++;
  }
  for (const d of POOL) { if (options.length >= 4) break; if (!options.includes(d)) options.push(d); }
  options = shuffle(options).slice(0, 4);
  while (options.length < 4) options.push('None of the above');
  const correctLetter = 'abcd'[options.map(o => o.toLowerCase()).indexOf(correct.toLowerCase())];
  return {
    category: 'Nursing', subcategory: SUB,
    question: stem,
    option_a: options[0], option_b: options[1], option_c: options[2], option_d: options[3],
    correct_answer: correctLetter,
    explanation: 'Review the emergency assessment, priorities, interventions, and prevention related to this topic.',
    difficulty: 'medium', active: true,
    canonKey: canon(stem, options),
  };
}
// ── Main generation ─────────────────────────────────────────
function main() {
  const seen = new Map();
  const add = (q) => { if (seen.has(q.canonKey)) return; seen.set(q.canonKey, q); };
  const notFam = () => FAMILIES.find(f => f.key === 'NOT');

  function mkNot(c) {
    const set = (c.s || []).concat(c.c || []).map(x => x.trim().toLowerCase()).filter(Boolean);
    const pool = POOL.filter(o => !set.includes(o));
    if (!pool.length || !set.length) { set.forEach(f => add(build(notFam().q(c.n), f))); return; }
    const correct = sample(pool);
    const options = shuffle([...shuffle(set).slice(0, 3), correct]).slice(0, 4);
    const cl = 'abcd'[options.map(o => o.toLowerCase()).indexOf(correct.toLowerCase())];
    const q = build(notFam().q(c.n), correct);
    q.option_a = options[0]; q.option_b = options[1]; q.option_c = options[2]; q.option_d = options[3];
    q.correct_answer = cl; q.canonKey = canon(q.question, options);
    add(q);
  }

  for (const c of CONDITIONS) {
    for (const fam of FAMILIES) {
      if (fam.key === 'NOT') { mkNot(c); continue; }
      const facts = c[fam.key] || [];
      for (const fact of facts) if (fact) add(build(fam.q(c.n), fact));
    }
  }

  const recipes = [];
  for (const c of CONDITIONS) {
    for (const fam of FAMILIES) {
      const facts = fam.key === 'NOT' ? (c.s || []).concat(c.c || []) : (c[fam.key] || []);
      for (const fact of facts) if (fact) recipes.push({ fam: fam.key, stem: fam.q(c.n), fact });
    }
  }
  const shuffled = shuffle(recipes);
  let pass = 0;
  while (seen.size < TARGET && pass < 220) {
    pass++;
    for (const r of shuffled) {
      if (seen.size >= TARGET) break;
      if (r.fam === 'NOT') continue;
      add(build(r.stem, r.fact));
    }
  }

  const list = [...seen.values()].map(({ canonKey, ...q }) => q);
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
  fs.writeFileSync(OUT_SQL, '-- Emergency (Nursing) seed. Run in Supabase SQL Editor.\nBEGIN;\n' + lines.join('\n') + '\nCOMMIT;\n');

  console.log('TOPICS:', CONDITIONS.length, '| POOL:', POOL.length);
  console.log('TARGET:', TARGET, '| GENERATED:', list.length);
  console.log('DUPLICATES (full text):', dups);
  console.log('JSON ->', OUT_JSON);
  console.log('SQL  ->', OUT_SQL);
}
main();