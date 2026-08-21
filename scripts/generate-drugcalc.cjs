// Drug Calculation MCQ generator (math-based, deduplicated).
// Run: node scripts/generate-drugcalc.cjs
const fs = require('fs');
const path = require('path');
const CATEGORY = 'Nursing';
const SUBCAT = 'Drug Calculation';

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randDec(a, b, d = 1) { const v = a + Math.random() * (b - a); const f = Math.pow(10, d); return Math.round(v * f) / f; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function round(v, d = 1) { const f = Math.pow(10, d); return Math.round(v * f) / f; }

// Build a question: correct + 3 plausible wrong options.
function q(text, correct, distr, d = 1) {
  return { text, correct: round(correct, d), distractors: distr.map(x => round(x, d)) };
}

const SEEN = new Set();
const QS = [];
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9 .]/g, ' ').replace(/\s+/g, ' ').trim(); }
function push(text, correct, distr, d = 1) {
  const cval = round(correct, d);
  const key = norm(text) + '|' + cval;
  if (SEEN.has(key)) return;
  SEEN.add(key);
  const opts = shuffle([cval, ...distr.map(x => round(x, d))]).slice(0, 4);
  const letters = ['a', 'b', 'c', 'd'];
  const order = shuffle(letters);
  const map = {};
  order.forEach((l, i) => { map[l] = String(opts[i] ?? ''); });
  // Point correct_answer at the letter that actually holds the correct value.
  const ci = opts.indexOf(cval);
  QS.push({
    category: CATEGORY, subcategory: SUBCAT, exam_type: 'bpsc',
    question: text, option_a: map.a, option_b: map.b, option_c: map.c, option_d: map.d,
    correct_answer: order[ci >= 0 ? ci : 0], explanation: `Correct answer: ${cval}`,
    difficulty: 'medium', importance: 3, active: true,
  });
}
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

// ---- Template generators (each returns a unique question) ----
function t_mgPerDose() {
  const w = randInt(30, 100); const daily = pick([2, 4, 8, 12]); const div = pick([1, 2, 3, 4]);
  const per = w * daily / div;
  return q(`A patient weighs ${w} kg. The order is ${daily} mg/kg/day divided every ${Math.round(24 / div)} hours. How many mg per dose?`, per, [per * 2, per / 2, per * 0.25]);
}
function t_mlPerDose() {
  const w = randInt(30, 100); const daily = pick([2, 5, 10, 15]); const div = pick([2, 3, 4]);
  const conc = pick([25, 50, 100, 125, 250]);
  const per = w * daily / div; const ml = per / conc;
  return q(`The order is ${daily} mg/kg/day in ${div} divided doses for a ${w} kg patient. The drug is available as ${conc} mg/mL. How many mL per dose?`, ml, [ml * 2, ml / 2, ml * 3]);
}
function t_mlPerHr() {
  const v = pick([500, 1000, 250, 100]); const h = randDec(2, 12, 1);
  return q(`Order: ${v} mL of IV fluid to infuse over ${h} hours. How many mL/hour?`, v / h, [v / h * 2, v / h / 2, v / (h + 1)]);
}
function t_gttPerMin() {
  const v = pick([500, 1000]); const h = randInt(4, 12); const gtt = pick([10, 15, 20, 60]);
  const val = v * gtt / (h * 60);
  return q(`Order: ${v} mL to infuse over ${h} hours with a drop factor of ${gtt} gtt/mL. How many gtt/min?`, val, [v * gtt / (h * 30), v * gtt / (h * 120), v * gtt / h]);
}
function t_tablets() {
  const dose = pick([250, 500, 750, 1000, 25, 50, 100]); const per = pick([125, 250, 500, 50, 100]);
  const n = dose / per;
  return q(`The order is ${dose} mg. The tablets are ${per} mg each. How many tablets should the nurse give?`, n, [n * 2, n / 2, n + 1]);
}
function t_mlAmpule() {
  const dose = pick([250, 500, 750, 1000]); const conc = pick([250, 500, 1000]);
  return q(`The order is ${dose} mg IV. The vial contains ${conc} mg/mL. How many mL should the nurse draw up?`, dose / conc, [dose / conc * 2, dose / conc / 2, dose / conc * 0.5]);
}
function t_lbToKg() {
  const lb = randInt(90, 220);
  return q(`A patient weighs ${lb} lb. How many kilograms does the patient weigh? (2.2 lb = 1 kg)`, lb / 2.2, [lb * 2.2, lb / 2.2 * 2, lb / 2.2 / 2]);
}
function t_mlPerMin() {
  const v = pick([250, 500, 1000]); const h = randInt(4, 12);
  return q(`Order: ${v} mL to infuse over ${h} hours. How many mL/min?`, v / (h * 60), [v / (h * 30), v / (h * 120), v / h]);
}
function t_recon() {
  const mg = pick([250, 500, 1000, 2000]); const dil = randDec(2, 10, 1); const conc = mg / dil; const dose = pick([125, 250, 500, 750]);
  return q(`Reconstitute a ${mg} mg vial with ${dil} mL sterile water to make ${conc} mg/mL. The order is ${dose} mg. How many mL should the nurse give?`, dose / conc, [dose / conc * 2, dose / conc / 2, dose / (conc * 2)]);
}
function t_ivTime() {
  const v = pick([250, 500, 1000, 1500]); const rate = randDec(25, 125, 0);
  return q(`Order: ${v} mL of IV fluid at ${rate} mL/hr. How many hours will the infusion last?`, v / rate, [v / rate * 2, v / rate / 2, v / rate + 1]);
}
function t_peds() {
  const w = randInt(8, 40); const per = pick([5, 10, 15, 20]); const conc = pick([25, 50, 100, 125]);
  const ml = w * per / conc;
  return q(`A child weighs ${w} kg. The order is ${per} mg/kg/dose every 8 hours. The drug is ${conc} mg/mL. How many mL per dose?`, ml, [ml * 2, ml / 2, ml * 3]);
}
function t_daily() {
  const w = randInt(30, 100); const daily = pick([2, 5, 10, 20]);
  return q(`The order is ${daily} mg/kg/day for a patient weighing ${w} kg. How many total mg per day?`, w * daily, [w * daily * 2, w * daily / 2, w * (daily + 1)]);
}
function t_insulin() {
  const units = pick([5, 10, 15, 20, 30]);
  return q(`The order is ${units} units of regular insulin. The vial is U-100 (100 units/mL). How many mL should the nurse administer?`, units / 100, [units / 50, units / 200, units / 10]);
}
function t_weightMlHr() {
  const w = randInt(40, 90); const per = pick([1, 2, 5, 10]); const conc = pick([250, 500, 1000]);
  const mlhr = w * per / conc * 1000;
  return q(`Order: ${per} mcg/kg/min for a ${w} kg patient. The concentration is ${conc} mg in 250 mL. How many mL/hr?`, mlhr, [mlhr * 2, mlhr / 2, mlhr * 0.5]);
}
function t_micro() {
  const v = pick([250, 500, 1000]); const h = randInt(2, 12);
  return q(`Order: ${v} mL over ${h} hours using a microdrip (60 gtt/mL). How many gtt/min?`, v / h, [v / h * 2, v / h / 2, v / (h * 2)]);
}
function t_dropsPerMinRev() {
  const v = pick([250, 500, 1000]); const gtt = pick([10, 15, 20]); const rate = randInt(60, 120);
  const mlmin = rate / gtt; const hours = v / (mlmin * 60);
  return q(`Infusing at ${rate} gtt/min with a drop factor of ${gtt} gtt/mL for ${v} mL. How many hours will the infusion run?`, hours, [hours * 2, hours / 2, hours + 1]);
}
function t_amoxicillin() {
  const w = randInt(10, 40); const per = pick([20, 40, 45, 50]); const conc = pick([100, 125, 250]);
  const ml = w * per / conc;
  return q(`Order: ${per} mg/kg/day divided every 8 hours for a ${w} kg child. The suspension is ${conc} mg/5 mL. How many mL per dose?`, (w * per / 3) / (conc / 5), [(w * per / 3) / (conc / 5) * 2, (w * per / 3) / (conc / 5) / 2, (w * per / 3) / (conc / 5) * 0.5]);
}
function t_hourlyIv() {
  const v = pick([250, 500, 750, 1000]); const mlhr = randInt(50, 150);
  return q(`Order: ${v} mL at ${mlhr} mL/hr. What is the infusion time in hours and minutes?`, Math.round((v / mlhr) * 60) / 60, [Math.round((v / mlhr) * 30) / 30, Math.round((v / mlhr) * 90) / 90, v / mlhr + 0.5]);
}
function t_mlPerDoseWide() {
  const w = randInt(20, 120); const daily = pick([1, 2, 4, 6, 8, 10, 15, 20]); const div = pick([2, 3, 4, 6]); const conc = pick([10, 25, 50, 100, 125, 250, 500]);
  const ml = (w * daily / div) / conc;
  return q(`The order is ${daily} mg/kg/day in ${div} divided doses for a ${w} kg patient. The drug is ${conc} mg/mL. How many mL per dose?`, ml, [ml * 2, ml / 2, ml * 3]);
}
function t_ivWide() {
  const v = pick([50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000]); const h = randDec(1, 24, 1);
  return q(`Order: ${v} mL of IV fluid over ${h} hours. How many mL/hour?`, v / h, [v / h * 2, v / h / 2, v / (h + 1)]);
}
function t_pedsWide() {
  const w = randInt(3, 50); const per = pick([5, 7.5, 10, 12.5, 15, 20, 25]); const conc = pick([25, 50, 100, 125, 200, 250]);
  const ml = w * per / conc;
  return q(`A child weighs ${w} kg. The order is ${per} mg/kg/dose. The drug is ${conc} mg/mL. How many mL per dose?`, ml, [ml * 2, ml / 2, ml * 3]);
}
function t_dropWide() {
  const v = pick([100, 250, 500, 1000]); const h = randDec(1, 24, 1); const gtt = pick([10, 15, 20, 60]);
  return q(`Order: ${v} mL over ${h} hours with a drop factor of ${gtt} gtt/mL. How many gtt/min?`, v * gtt / (h * 60), [v * gtt / (h * 30), v * gtt / (h * 120), v * gtt / h]);
}
function t_reconWide() {
  const mg = pick([250, 500, 1000, 2000, 4000]); const dil = randDec(2, 20, 1); const conc = mg / dil; const dose = pick([100, 250, 500, 1000]);
  return q(`Reconstitute a ${mg} mg vial with ${dil} mL sterile water (yields ${conc} mg/mL). The order is ${dose} mg. How many mL?`, dose / conc, [dose / conc * 2, dose / conc / 2, dose / (conc * 2)]);
}
function t_tabletWide() {
  const dose = pick([100, 200, 250, 300, 400, 500, 600, 750, 1000, 1500]); const per = pick([25, 50, 100, 125, 250, 500]);
  const n = dose / per;
  return q(`The order is ${dose} mg. The tablets are ${per} mg each. How many tablets?`, n, [n * 2, n / 2, n + 1]);
}
function main() {
  const templates = [t_mgPerDose, t_mlPerDose, t_mlPerHr, t_gttPerMin, t_tablets, t_mlAmpule, t_lbToKg, t_mlPerMin, t_recon, t_ivTime, t_peds, t_daily, t_insulin, t_weightMlHr, t_micro, t_dropsPerMinRev, t_amoxicillin, t_hourlyIv, t_mlPerDoseWide, t_ivWide, t_pedsWide, t_dropWide, t_reconWide, t_tabletWide];
  let iter = 0;
  while (QS.length < 20000 && iter < 200000) {
    const fn = templates[iter % templates.length];
    const r = fn();
    push(r.text, r.correct, r.distractors, 2);
    iter++;
  }
  const dir = path.resolve(__dirname, '..', 'artifacts', 'mobile');
  fs.writeFileSync(path.join(dir, 'drugcalc-nursing.json'), JSON.stringify(QS));
  const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "''");
  const keys = ['category', 'subcategory', 'exam_type', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'difficulty', 'importance', 'active'];
  const rows = QS.map(q => `(${keys.map(k => `'${esc(q[k])}'`).join(',')})`);
  fs.writeFileSync(path.join(dir, 'drugcalc-nursing.sql'), 'INSERT INTO questions (' + keys.join(',') + ') VALUES\n' + rows.join(',\n') + ';');
  console.log('Generated unique Drug Calculation MCQs:', QS.length);
}
main();