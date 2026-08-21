// Hospital Management MCQ generator (concept), deduplicated by question text.
// Run: node scripts/generate-hospital.cjs
const fs = require('fs');
const path = require('path');
const CATEGORY = 'Nursing';
const SUBCAT = 'Hospital Management';

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
const SEEN = new Set(); const QS = [];
function push(text, correct, distr) {
  const key = norm(text); if (SEEN.has(key)) return; SEEN.add(key);
  const others = shuffle(distr.filter(x => norm(x) !== norm(correct))).slice(0, 3);
  const slot = randInt(0, 3); const arr = ['', '', '', '']; let k = 0;
  for (let i = 0; i < 4; i++) arr[i] = i === slot ? correct : (others[k++] ?? '');
  const order = shuffle(['a', 'b', 'c', 'd']); const map = {};
  order.forEach((l, i) => { map[l] = arr[i]; });
  QS.push({ category: CATEGORY, subcategory: SUBCAT, exam_type: 'bpsc', question: text,
    option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d, correct_answer: order[slot],
    explanation: `Correct: ${correct}`, difficulty: 'medium', importance: 3, active: true });
}

const ROLES = [
  { n: 'Nurse Manager', def: 'responsible for the daily operations of a nursing unit', act: ['overseeing staffing on the unit', 'managing the unit budget', 'coordinating patient care delivery', 'handling unit-level personnel issues'] },
  { n: 'Charge Nurse', def: 'coordinates patient care and staff for a shift', act: ['assigning patients to nurses for a shift', 'supervising care during a shift', 'addressing immediate shift problems'] },
  { n: 'Case Manager', def: 'coordinates care and discharge planning for patients', act: ['planning the patient\'s discharge', 'coordinating services across providers', 'managing the patient\'s care continuum'] },
  { n: 'Infection Control Nurse', def: 'monitors and prevents healthcare-associated infections', act: ['tracking infection rates', 'teaching infection prevention', 'investigating infection outbreaks'] },
  { n: 'Quality Improvement Coordinator', def: 'leads efforts to improve care quality and safety', act: ['running quality audits', 'leading improvement projects', 'monitoring quality indicators'] },
];
for (const r of ROLES) {
  push(`Which statement best defines the ${r.n}?`, r.def, ROLES.map(x => x.def).filter(x => x !== r.def));
  push(`A nurse ${r.act[0]}. Which role is this?`, r.n, ROLES.map(x => x.n).filter(x => x !== r.n));
  for (const a of r.act) push(`Which action is the responsibility of the ${r.n}?`, a, ROLES.flatMap(x => x.act).filter(x => x !== a));
}

const QI = [
  ['Plan', 'In the PDSA cycle, which step involves deciding what change to test?'],
  ['Do', 'In the PDSA cycle, which step involves carrying out the test?'],
  ['Study', 'In the PDSA cycle, which step involves analyzing the results?'],
  ['Act', 'In the PDSA cycle, which step involves adopting or adjusting the change?'],
];
for (const [ans, q] of QI) push(q, ans, QI.map(x => x[0]).filter(x => x !== ans));

const CONCEPTS = [
  ['Incident report', 'a confidential record of an unexpected event in care'],
  ['Sentinel event', 'an unexpected event involving death or serious harm'],
  ['Near miss', 'an event that could have caused harm but did not'],
  ['Root cause analysis', 'a method to identify the underlying cause of an event'],
  ['Adverse event', 'harm that results from medical care'],
  ['Benchmarking', 'comparing performance against a standard or best practice'],
  ['Variance (budget)', 'the difference between the planned and actual budget'],
  ['Operating budget', 'the budget for day-to-day running of the unit'],
  ['Capital budget', 'the budget for major equipment and facilities'],
  ['Nurse-to-patient ratio', 'the number of nurses available for a given number of patients'],
  ['Acuity', 'a measure of the level of care a patient needs'],
  ['Accreditation', 'review of a hospital against set quality standards'],
];
for (const [t, def] of CONCEPTS) {
  push(`Which best defines "${t}"?`, def, CONCEPTS.map(x => x[1]).filter(x => x !== def));
  push(`Which hospital management term matches: "${def}"?`, t, CONCEPTS.map(x => x[0]).filter(x => x !== t));
}

// Output
const dir = path.resolve(__dirname, '..', 'artifacts', 'mobile');
fs.writeFileSync(path.join(dir, 'hospital-management-nursing.json'), JSON.stringify(QS));
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
const keys = ['category', 'subcategory', 'exam_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty', 'importance', 'active'];
fs.writeFileSync(path.join(dir, 'hospital-management-nursing.sql'), 'INSERT INTO questions (' + keys.join(',') + ') VALUES\n' + QS.map(q => `(${keys.map(k => `'${esc(q[k])}'`).join(',')})`).join(',\n') + ';');
console.log('Generated unique Hospital Management MCQs:', QS.length);