// Nursing Leadership MCQ generator, deduplicated, deterministic answers.
// Run: node scripts/generate-leadership.cjs
const fs = require('fs');
const path = require('path');
const CATEGORY = 'Nursing';
const SUBCAT = 'Leadership & Management';

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

const SEEN = new Set();
const QS = [];
function push(text, correct, distr) {
  const key = norm(text);
  if (SEEN.has(key)) return;
  SEEN.add(key);
  const others = shuffle(distr.filter(x => norm(x) !== norm(correct))).slice(0, 3);
  const slot = randInt(0, 3);
  const arr = ['', '', '', ''];
  let k = 0;
  for (let i = 0; i < 4; i++) arr[i] = i === slot ? correct : (others[k++] ?? '');
  const order = shuffle(['a', 'b', 'c', 'd']);
  const map = {};
  order.forEach((l, i) => { map[l] = arr[i]; });
  QS.push({
    category: CATEGORY, subcategory: SUBCAT, exam_type: 'bpsc',
    question: text, option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d,
    correct_answer: order[slot], explanation: `Correct: ${correct}`,
    difficulty: 'medium', importance: 3, active: true,
  });
}

function pickNot(s) { return shuffle(STYLES.flatMap(x => x.bh).filter(b => !s.bh.includes(b)))[0]; }
const STYLES = [
  { n: 'Transformational leadership', def: 'inspires followers toward a shared vision and growth',
    bh: ['motivating staff toward a shared vision', 'acting as a role model for professional growth', 'empowering staff to reach higher performance', 'promoting innovation and change'] },
  { n: 'Transactional leadership', def: 'motivates through rewards and consequences for task completion',
    bh: ['rewarding staff who meet targets', 'using incentives to obtain compliance', 'exchanging rewards for performance', 'correcting staff who fail expectations'] },
  { n: 'Autocratic leadership', def: 'makes decisions alone with little staff input',
    bh: ['making decisions without consulting staff', 'giving direct orders', 'controlling all decisions in the unit', 'directing staff with little input'] },
  { n: 'Democratic leadership', def: 'involves staff in decision-making and values input',
    bh: ['seeking staff input before deciding', 'encouraging group participation in decisions', 'valuing each team member\'s opinion', 'consensus-based decision making'] },
  { n: 'Laissez-faire leadership', def: 'gives staff full freedom with minimal direction',
    bh: ['leaving staff to make their own decisions', 'providing minimal supervision', 'allowing the group to work independently', 'intervening only when asked'] },
  { n: 'Servant leadership', def: 'prioritizes the needs and growth of the team',
    bh: ['putting the needs of staff first', 'supporting the growth of followers', 'serving the team rather than directing', 'building a caring team culture'] },
  { n: 'Situational leadership', def: 'adjusts the leadership style to the staff situation',
    bh: ['adapting the style to staff readiness', 'changing direction based on the task and team', 'matching leadership to the situation', 'flexibly directing or supporting as needed'] },
];

for (const s of STYLES) {
  push(`Which statement best defines ${s.n}?`, s.def, STYLES.map(x => x.def).filter(x => x !== s.def));
  push(`A nurse ${s.bh[0]}. Which leadership style is this?`, s.n, STYLES.map(x => x.n).filter(x => x !== s.n));
  for (const b of s.bh) {
    push(`Which action reflects ${s.n}?`, b, STYLES.flatMap(x => x.bh).filter(x => x !== b));
    const not = pickNot(s);
    push(`Which of the following does NOT reflect ${s.n}?`, not, STYLES.flatMap(x => x.bh).filter(x => x !== not));
  }
}
const FUNCTIONS = [
  { n: 'Planning', def: 'setting goals and deciding how to achieve them',
    act: ['setting unit goals for the year', 'developing a plan for staffing', 'determining priorities and timelines'] },
  { n: 'Organizing', def: 'arranging resources and structure to carry out the plan',
    act: ['assigning roles and responsibilities', 'structuring the work of the team', 'organizing resources for care delivery'] },
  { n: 'Staffing', def: 'ensuring the right number and mix of personnel',
    act: ['scheduling adequate staff per shift', 'matching staff skill to patient needs', 'recruiting and orienting new nurses'] },
  { n: 'Directing', def: 'guiding and supervising staff in the work',
    act: ['providing direction to staff', 'supervising patient care activities', 'delegating and guiding team members'] },
  { n: 'Controlling', def: 'evaluating outcomes against standards and correcting',
    act: ['evaluating the quality of care given', 'comparing outcomes to standards', 'correcting performance that falls short'] },
];
for (const f of FUNCTIONS) {
  push(`Which statement best defines the management function of ${f.n}?`, f.def, FUNCTIONS.map(x => x.def).filter(x => x !== f.def));
  push(`A nurse ${f.act[0]}. Which management function is this?`, f.n, FUNCTIONS.map(x => x.n).filter(x => x !== f.n));
  for (const a of f.act) push(`Which action is part of ${f.n}?`, a, FUNCTIONS.flatMap(x => x.act).filter(x => x !== a));
}

const RIGHTS = [
  ['Right Task', 'the task must be within the delegatee\'s scope of practice'],
  ['Right Circumstance', 'the patient setting must match the task and delegatee'],
  ['Right Person', 'the right person must be assigned the task'],
  ['Right Direction/Communication', 'clear instructions and communication must be given'],
  ['Right Supervision/Evaluation', 'the delegator must supervise and evaluate the outcome'],
];
for (const [name, def] of RIGHTS) {
  push(`Which is the "Right Task" in delegation?`, 'The task must be within the delegatee\'s scope of practice', RIGHTS.map(r => r[1]).filter(x => x !== def));
  push(`Which delegation right is met when the task matches the delegatee\'s scope of practice?`, 'Right Task', RIGHTS.map(r => r[0]).filter(x => x !== name));
  push(`The delegator gives clear instructions to the unlicensed assistive personnel. Which right of delegation is this?`, 'Right Direction/Communication', RIGHTS.map(r => r[0]).filter(x => x !== name));
}

const CONFLICT = [
  { n: 'Competing', def: 'asserting one\'s own position to win the conflict', b: ['pursuing your own goal aggressively', 'standing firm on your position'] },
  { n: 'Collaborating', def: 'working together to find a solution that satisfies both parties', b: ['integrating the concerns of both parties', 'finding a win-win solution', 'working jointly to resolve the issue'] },
  { n: 'Compromising', def: 'each party gives up something to reach a middle ground', b: ['meeting halfway on the issue', 'each side giving up a little', 'negotiating a mutually acceptable middle'] },
  { n: 'Avoiding', def: 'withdrawing from or ignoring the conflict', b: ['postponing the conflict', 'ignoring the disagreement', 'withdrawing from the dispute'] },
  { n: 'Accommodating', def: 'yielding to the other party\'s wishes', b: ['giving in to the other party', 'placing the other\'s needs first', 'sacrificing your own position'] },
];
for (const c of CONFLICT) {
  push(`Which conflict style involves ${c.def}?`, c.n, CONFLICT.map(x => x.n).filter(x => x !== c.n));
  for (const b of c.b) push(`A nurse ${b}. Which conflict management style is this?`, c.n, CONFLICT.map(x => x.n).filter(x => x !== c.n));
}

const PRIORITY = [
  ['airway, breathing, circulation', 'The nurse should prioritize which of the following?'],
  ['an airway problem before a bleeding wound', 'What should the nurse address first?'],
  ['Maslow\'s hierarchy', 'Which framework guides prioritizing physiological needs before self-esteem needs?'],
  ['the most acute patient first', 'When triaging, the nurse should see which patient first?'],
];
// Prioritization simple concept questions
for (let i = 0; i < PRIORITY.length; i++) push(`In prioritization, ${PRIORITY[i][0]}. ${PRIORITY[i][1]}`, PRIORITY[i][0], PRIORITY.map(p => p[0]).filter((x, j) => j !== i));

// Output
const dir = path.resolve(__dirname, '..', 'artifacts', 'mobile');
fs.writeFileSync(path.join(dir, 'leadership-nursing.json'), JSON.stringify(QS));
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
const keys = ['category', 'subcategory', 'exam_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty', 'importance', 'active'];
fs.writeFileSync(path.join(dir, 'leadership-nursing.sql'), 'INSERT INTO questions (' + keys.join(',') + ') VALUES\n' + QS.map(q => `(${keys.map(k => `'${esc(q[k])}'`).join(',')})`).join(',\n') + ';');
console.log('Generated unique Leadership MCQs:', QS.length);