// Concept MCQ generator — writes ORIGINAL questions from a facts/syllabus base.
// Reads scripts/concept-facts.cjs -> CATEGORIES:[{sub, FACTS:[[term, def, points?]]}]
// Run: node scripts/generate-concept.cjs
const fs = require('fs');
const path = require('path');
const { CATEGORIES } = require('./concept-facts.cjs');
const CATEGORY = 'Nursing';

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

for (const c of CATEGORIES) {
  const QS = []; const SEEN = new Set();
  const defs = c.FACTS.map(f => f[1]);
  const terms = c.FACTS.map(f => f[0]);
  function push(text, correct, distr) {
    const key = norm(text); if (SEEN.has(key)) return; SEEN.add(key);
    const others = shuffle(distr.filter(x => norm(x) !== norm(correct))).slice(0, 3);
    const slot = randInt(0, 3); const arr = ['', '', '', '']; let k = 0;
    for (let i = 0; i < 4; i++) arr[i] = i === slot ? correct : (others[k++] ?? '');
    const order = shuffle(['a', 'b', 'c', 'd']); const map = {};
    order.forEach((l, i) => { map[l] = arr[i]; });
    QS.push({ category: CATEGORY, subcategory: c.sub, exam_type: 'bpsc', question: text,
      option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d, correct_answer: order[slot],
      explanation: `Correct: ${correct}`, difficulty: 'medium', importance: 3, active: true });
  }
  for (const [term, def, pts] of c.FACTS) {
    push(`Which statement best describes "${term}"?`, def, defs.filter(x => x !== def));
    push(`Which nursing term matches: "${def}"?`, term, terms.filter(x => x !== term));
    if (pts && pts.length) {
      for (const p of pts) push(`Which is a key point about "${term}"?`, p, defs.concat(pts).filter(x => x !== p));
    }
  }
  const slug = c.sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
  fs.writeFileSync(path.join(__dirname, '..', 'artifacts', 'mobile', slug + '-nursing.json'), JSON.stringify(QS));
  const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
  const keys = ['category', 'subcategory', 'exam_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty', 'importance', 'active'];
  fs.writeFileSync(path.join(__dirname, '..', 'artifacts', 'mobile', slug + '-nursing.sql'),
    'INSERT INTO questions (' + keys.join(',') + ') VALUES\n' + QS.map(q => `(${keys.map(k => `'${esc(q[k])}'`).join(',')})`).join(',\n') + ';');
  console.log(c.sub + ': ' + QS.length + ' unique');
}