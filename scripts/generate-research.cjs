// Nursing Research MCQ generator (stats-based + terminology), deduplicated.
// Run: node scripts/generate-research.cjs
const fs = require('fs');
const path = require('path');
const CATEGORY = 'Nursing';
const SUBCAT = 'Research & Evidence-Based Practice';

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function round(v, d = 2) { const f = Math.pow(10, d); return Math.round(v * f) / f; }

const SEEN = new Set();
const QS = [];
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 .%]/g, ' ').replace(/\s+/g, ' ').trim(); }
function push(text, correct, distr, d = 2) {
  const cval = typeof correct === 'number' ? round(correct, d) : correct;
  const key = norm(text) + '|' + String(cval);
  if (SEEN.has(key)) return;
  SEEN.add(key);
  const vals = distr.map(x => typeof x === 'number' ? round(x, d) : x).filter(x => String(x) !== String(cval));
  const others = shuffle(vals).slice(0, 3);
  const slot = randInt(0, 3);
  const arr = ['', '', '', ''];
  let k = 0;
  for (let i = 0; i < 4; i++) arr[i] = i === slot ? String(cval) : (others[k++] ?? '');
  const letters = ['a', 'b', 'c', 'd'];
  const order = shuffle(letters);
  const map = {};
  order.forEach((l, i) => { map[l] = String(arr[i]); });
  QS.push({
    category: CATEGORY, subcategory: SUBCAT, exam_type: 'bpsc',
    question: text, option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d,
    correct_answer: order[slot], explanation: `Correct answer: ${cval}`,
    difficulty: 'medium', importance: 3, active: true,
  });
}

// ---- Numeric / statistics templates ----
function t_mean() {
  const n = randInt(4, 6); const v = Array.from({ length: n }, () => randInt(2, 98));
  const m = v.reduce((a, b) => a + b, 0) / n;
  return { text: `What is the mean of the values ${v.join(', ')}?`, correct: m, distr: [m * 1.5, m * 0.5, m + 5] };
}
function t_median() {
  const n = randInt(5, 7); const v = Array.from({ length: n }, () => randInt(1, 100));
  const s = v.slice().sort((a, b) => a - b); const md = s[Math.floor(n / 2)];
  return { text: `What is the median of the values ${v.join(', ')}?`, correct: md, distr: [s[0], s[n - 1], md + 1] };
}
function t_mode() {
  const base = randInt(2, 9); const n = randInt(4, 5); const v = [base, base, ...Array.from({ length: n - 1 }, () => { let x = randInt(1, 10); while (x === base) x = randInt(1, 10); return x; })];
  return { text: `What is the mode of the values ${v.join(', ')}?`, correct: base, distr: [base + 1, base - 1, Math.max(...v) ] };
}
function t_range() {
  const v = Array.from({ length: 5 }, () => randInt(10, 90));
  const r = Math.max(...v) - Math.min(...v);
  return { text: `What is the range of the values ${v.join(', ')}?`, correct: r, distr: [r + 10, r * 1.5, r - 5] };
}
function t_sum() {
  const v = Array.from({ length: 5 }, () => randInt(1, 20));
  const s = v.reduce((a, b) => a + b, 0);
  return { text: `What is the sum of the values ${v.join(', ')}?`, correct: s, distr: [s + 1, s * 2, s - 1] };
}
function t_percent() {
  const total = randInt(50, 300); const x = randInt(10, Math.floor(total * 0.9));
  return { text: `In a study of ${total} participants, ${x} showed improvement. What percentage improved?`, correct: x / total * 100, distr: [x / total * 50, x / total * 200, x / total * 100 + 5] };
}
function t_proportion() {
  const m = randInt(50, 250); const x = randInt(5, Math.floor(m * 0.8));
  return { text: `Of ${m} patients, ${x} developed the outcome. What is the proportion who developed it?`, correct: x / m, distr: [x / m * 2, x / m / 2, x / (m + 10)] };
}
function t_avgWeighted() {
  const a = randInt(5, 15), b = randInt(20, 40);
  const avg = (a + b) / 2;
  return { text: `A study compares two groups with means of ${a} and ${b} on a scale. What is the average of the two group means?`, correct: avg, distr: [a, b, avg * 1.5] };
}
function t_meanDec() {
  const v = Array.from({ length: 5 }, () => randInt(1, 99) + Math.round(Math.random()) * 0.5);
  const m = v.reduce((a, b) => a + b, 0) / 5;
  return { text: `What is the mean of the values ${v.map(x => Number.isInteger(x) ? x : x.toFixed(1)).join(', ')}?`, correct: m, distr: [m * 1.5, m * 0.5, m + 2] };
}
function t_medianEven() {
  const v = Array.from({ length: 6 }, () => randInt(1, 100));
  const s = v.slice().sort((a, b) => a - b); const md = (s[2] + s[3]) / 2;
  return { text: `What is the median of the values ${v.join(', ')}?`, correct: md, distr: [s[2], s[3], md + 1] };
}
function t_prob() {
  const n = randInt(40, 200); const x = randInt(4, Math.floor(n * 0.5));
  return { text: `In ${n} trials, the event occurred ${x} times. What is the probability of the event?`, correct: x / n, distr: [x / n * 2, x / n / 2, x / (n * 2)] };
}
function t_ratio() {
  const a = randInt(1, 9), b = randInt(1, 9);
  return { text: `In a study, ${a} patients improved and ${b} did not. What is the ratio of improved to not improved?`, correct: `${a} : ${b}`, distr: [`${b} : ${a}`, `${a + 1} : ${b}`, `${a} : ${b + 1}`] };
}
function t_pctIncrease() {
  const base = randInt(100, 500); const inc = randInt(20, Math.floor(base * 0.5));
  const now = base + inc;
  return { text: `A hospital's EBP compliance rose from ${base} cases to ${now}. What is the percent increase?`, correct: inc / base * 100, distr: [inc / base * 50, inc / base * 200, now / base * 100] };
}
function t_meanMore() {
  const v = Array.from({ length: 8 }, () => randInt(1, 50));
  const m = v.reduce((a, b) => a + b, 0) / 8;
  return { text: `What is the mean of the values ${v.join(', ')}?`, correct: m, distr: [m * 1.25, m * 0.75, m + 3] };
}
function t_relativeFreq() {
  const n = randInt(50, 200); const x = randInt(10, Math.floor(n * 0.7));
  return { text: `A value appeared ${x} times out of ${n} observations. What is its relative frequency?`, correct: x / n, distr: [x / n * 2, x / n / 2, x / (n + 20)] };
}
// ---- Terminology base ----
const TERMS = [
  ['Randomized controlled trial', 'a study that randomly assigns participants to groups to test an intervention'],
  ['Cohort study', 'a study that follows a group over time to observe outcomes'],
  ['Case-control study', 'a study that compares people with a condition to those without, looking backward'],
  ['Cross-sectional study', 'a study that measures exposure and outcome at one point in time'],
  ['Qualitative research', 'research that explores experiences using non-numerical data'],
  ['Quantitative research', 'research that uses numerical data and statistics'],
  ['Independent variable', 'the variable the researcher manipulates'],
  ['Dependent variable', 'the outcome being measured in a study'],
  ['Hypothesis', 'a testable prediction about the study relationship'],
  ['Null hypothesis', 'the statement that there is no relationship between the variables'],
  ['p-value', 'the probability that a result is due to chance'],
  ['Statistical significance', 'a result unlikely to be due to chance, usually when p is less than 0.05'],
  ['Reliability', 'the consistency of a measurement'],
  ['Validity', 'the extent to which a measure reflects what it claims to measure'],
  ['Sampling', 'selecting a portion of the population to study'],
  ['Randomization', 'assigning participants to groups by chance'],
  ['Blinding', 'hiding group assignment from participants or researchers'],
  ['Bias', 'a systematic error that distorts the results'],
  ['Evidence-based practice', 'using the best research evidence with clinical judgment and patient values'],
  ['Institutional review board (IRB)', 'a committee that reviews the ethics of research'],
];
function addTerms() {
  for (const [term, def] of TERMS) {
    push(`Which statement best defines "${term}"?`, def, TERMS.map(t => t[1]).filter(d => d !== def));
    push(`Which research term matches the definition: "${def}"?`, term, TERMS.map(t => t[0]).filter(d => d !== term));
  }
}
function main() {
  addTerms();
  const templates = [t_mean, t_median, t_mode, t_range, t_sum, t_percent, t_proportion, t_avgWeighted, t_meanDec, t_medianEven, t_prob, t_ratio, t_pctIncrease, t_meanMore, t_relativeFreq];
  let iter = 0;
  while (QS.length < 20000 && iter < 200000) {
    const fn = templates[iter % templates.length];
    const r = fn(); push(r.text, r.correct, r.distr, 2); iter++;
  }
  const dir = path.resolve(__dirname, '..', 'artifacts', 'mobile');
  fs.writeFileSync(path.join(dir, 'research-nursing.json'), JSON.stringify(QS));
  const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
  const keys = ['category', 'subcategory', 'exam_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty', 'importance', 'active'];
  fs.writeFileSync(path.join(dir, 'research-nursing.sql'), 'INSERT INTO questions (' + keys.join(',') + ') VALUES\n' + QS.map(q => `(${keys.map(k => `'${esc(q[k])}'`).join(',')})`).join(',\n') + ';');
  console.log('Generated unique Research MCQs:', QS.length);
}
main();