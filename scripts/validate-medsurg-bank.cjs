const b = require('../artifacts/mobile/src/data/nursing_ms_mcqs.json');
let bad = 0, dup = 0;
const seen = new Set();
const stems = new Set();
for (const q of b) {
  const options = [q.option_a, q.option_b, q.option_c, q.option_d];
  if (!q.question || !options.every(x => x && String(x).trim())) bad++;
  if (!/^[a-d]$/.test(q.correct_answer || '')) bad++;
  const k = q.question + '|' + options.join('~');
  if (seen.has(k)) dup++;
  seen.add(k);
  stems.add(String(q.question).toLowerCase());
}
console.log('total:', b.length, '| invalid rows:', bad, '| full-text duplicates:', dup, '| unique stems:', stems.size);
const s = b[Math.floor(Math.random() * b.length)];
console.log('sample:', JSON.stringify({
  question: s.question, option_a: s.option_a, option_b: s.option_b,
  option_c: s.option_c, option_d: s.option_d, answer: s.correct_answer,
  cat: s.category, sub: s.subcategory,
}));