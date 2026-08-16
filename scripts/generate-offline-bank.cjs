/**
 * Generate a real, bundled offline question bank from the repo's SQL seed data.
 *
 * Reads `artifacts/mobile/*.sql` files, extracts `questions` / `mcqs` rows,
 * validates each row (non-empty question + 4 options + a..d answer), and writes
 * a compact JSON module consumed by the app as a guaranteed fallback when the
 * Appwrite `questions` collection is empty, broken, or unreachable.
 *
 * Run:  node scripts/generate-offline-bank.cjs
 * Out:  artifacts/mobile/src/data/offlineQuestions.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MOBILE = path.join(ROOT, 'artifacts', 'mobile');
const OUT = path.join(MOBILE, 'src', 'data', 'offlineQuestions.json');

const MAX_DOCS = 2000; // keep the bundled bank a sane size for the JS bundle

const COL_MAP = {
  category: 'category', category_name: 'category',
  subcategory: 'subcategory', sub_category: 'subcategory', subcat: 'subcategory',
  question: 'question', mcq: 'question', q: 'question',
  option_a: 'option_a', option1: 'option_a', a: 'option_a',
  option_b: 'option_b', option2: 'option_b', b: 'option_b',
  option_c: 'option_c', option3: 'option_c', c: 'option_c',
  option_d: 'option_d', option4: 'option_d', d: 'option_d',
  correct_answer: 'correct_answer', answer: 'correct_answer', ans: 'correct_answer',
  explanation: 'explanation', explaination: 'explanation', solution: 'explanation',
  memory_tip: 'memory_tip', formula: 'formula', solution_step: 'solution_step',
  difficulty: 'difficulty', level: 'difficulty',
  importance: 'importance', language: 'language',
  active: 'active', is_active: 'active', verified: 'verified',
  subject: 'subject', topic: 'subject', chapter: 'chapter', exam: 'exam_type',
  exam_type: 'exam_type', exam_name: 'exam_type', mark: 'importance',
  tags: 'tags', memorytip: 'memory_tip', solutionstep: 'solution_step',
};

function splitCells(body) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "'") { if (body[i + 1] === "'") { cur += "'"; i++; continue; } q = !q; continue; }
    if (!q && c === ',') { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim() !== '') out.push(cur.trim());
  return out;
}

function unescape(v) {
  const s = String(v).replace(/^'(.*)'$/, '$1');
  if (/^'(.*)'$/.test(String(v))) return s.replace(/''/g, "'");
  return v;
}

function toBool(v) {
  return /^(true|t|1|yes)$/i.test(String(v));
}

function clean(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\'/g, "'").replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\').replace(/\\n/g, '\n')
    .replace(/\\r/g, '').trim();
}

function toAnswer(v) {
  const s = String(v).toLowerCase().trim();
  if (/^(a|b|c|d)$/.test(s)) return s;
  if (s.includes('option a') || s === '1') return 'a';
  if (s.includes('option b') || s === '2') return 'b';
  if (s.includes('option c') || s === '3') return 'c';
  if (s.includes('option d') || s === '4') return 'd';
  if (s.length && 'abcd'.includes(s[0])) return s[0];
  return null;
}

function buildRow(cols, cells) {
  const doc = {};
  for (let k = 0; k < cols.length; k++) {
    const target = COL_MAP[cols[k].toLowerCase()];
    if (!target) continue;
    const raw = cells[k] != null ? cells[k] : '';
    const v = unescape(raw);
    if (v === '' || v === 'NULL') continue;
    if (target === 'correct_answer') {
      const ans = toAnswer(v);
      if (ans) doc[target] = ans;
    } else if (target === 'tags') {
      doc[target] = String(v).split(',').map(x => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
    } else if (target === 'active' || target === 'verified') {
      doc[target] = toBool(v);
    } else if (target === 'importance') {
      doc[target] = parseInt(v, 10) || 3;
    } else {
      doc[target] = v;
    }
  }
  return doc;
}

function parseFile(content) {
  const docs = [];
  const re = /INSERT\s+INTO\s+(?:public\.)?(mcqs|questions)\s*\(/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    const after = content.indexOf(')', m.index + m[0].length);
    if (after < 0) break;
    const cols = content.slice(m.index + m[0].length, after).split(',').map(c => c.trim());
    const vIdx = content.toUpperCase().indexOf('VALUES', after);
    if (vIdx < 0) { re.lastIndex = after + 1; continue; }
    let i = vIdx + 6;
    while (i < content.length) {
      while (i < content.length && content[i] !== '(') i++;
      if (i >= content.length) break;
      let depth = 0, q = false, start = i, closed = false;
      for (; i < content.length; i++) {
        const ch = content[i];
        if (ch === "'") { if (content[i + 1] === "'") { i++; continue; } q = !q; continue; }
        if (!q && ch === '(') depth++;
        if (!q && ch === ')') { depth--; if (depth === 0) { closed = true; i++; break; } }
      }
      if (closed) {
        const body = content.slice(start + 1, i - 1).trim();
        if (body) {
          const doc = buildRow(cols, splitCells(body));
          if (doc && doc.question) docs.push(doc);
        }
      } else break;
      let j = i;
      while (j < content.length && /[,\s]/.test(content[j])) j++;
      if (content[j] === ';') { re.lastIndex = j + 1; break; }
    }
  }
  return docs;
}

function finalize(doc, idx) {
  const question = clean(doc.question);
  const a = clean(doc.option_a);
  const b = clean(doc.option_b);
  const c = clean(doc.option_c);
  const d = clean(doc.option_d);
  const answer = doc.correct_answer || null;
  if (!question || !a || !b || !c || !d || !answer) return null;

  let category = clean(doc.category) || 'General Knowledge';
  if (/^বাংলা|বাংলা/.test(category)) category = 'Bangla'; // normalize Bengali-script name
  const difficulty = ['easy', 'medium', 'hard'].includes(clean(doc.difficulty)) ? clean(doc.difficulty) : 'medium';
  const nImp = Number(doc.importance);
  const importance = Number.isFinite(nImp) && nImp >= 1 && nImp <= 5 ? nImp : 3;

  return {
    id: doc.$id || `offline-${idx + 1}`,
    category,
    subcategory: clean(doc.subcategory) || 'General',
    exam_type: clean(doc.exam_type) || 'bpsc',
    subject: clean(doc.subject),
    chapter: clean(doc.chapter),
    question,
    option_a: a,
    option_b: b,
    option_c: c,
    option_d: d,
    correct_answer: answer,
    explanation: clean(doc.explanation),
    difficulty,
    importance,
    tags: Array.isArray(doc.tags) && doc.tags.length ? doc.tags : [],
    language: ['english', 'bangla', 'mixed'].includes(clean(doc.language)) ? clean(doc.language) : 'english',
    verified: true,
    active: doc.active == null ? true : Boolean(doc.active),
  };
}

// Round-robin allocation across categories so every category is represented
function allocateBalanced(unique, totalCap) {
  const byCat = new Map();
  for (const q of unique) {
    const c = q.category || 'General Knowledge';
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c).push(q);
  }
  // Within each category, prefer questions that carry a real subcategory/chapter
  // (so chapter practice has matching content) over generic 'General' ones.
  const cats = [...byCat.keys()];
  for (const c of cats) {
    const list = byCat.get(c);
    list.sort((x, y) => {
      const xs = (x.subcategory ? x.subcategory.trim().toLowerCase() : '');
      const ys = (y.subcategory ? y.subcategory.trim().toLowerCase() : '');
      const xGood = xs && xs !== 'general' ? 1 : 0;
      const yGood = ys && ys !== 'general' ? 1 : 0;
      if (xGood !== yGood) return yGood - xGood;
      return 0;
    });
  }
  const per = Math.floor(totalCap / Math.max(cats.length, 1));
  const out = [];
  const idx = cats.map(() => 0);
  let added = true;
  while (added && out.length < totalCap) {
    added = false;
    for (let ci = 0; ci < cats.length; ci++) {
      if (out.length >= totalCap) break;
      const list = byCat.get(cats[ci]);
      const budget = Math.min(list.length, per);
      const rounds = out.filter(x => x.category === cats[ci]).length;
      if (rounds < budget && idx[ci] < list.length) {
        out.push(list[idx[ci]++]);
        added = true;
      }
    }
  }
  return out;
}

function main() {
  const files = fs.readdirSync(MOBILE).filter(f => f.endsWith('.sql') && !/schema/i.test(f));
  // Process curated seed files first so their well-labeled flagship chapters are
  // sampled before the huge auto-generated file fills the per-category budget.
  files.sort((a, b) => {
    const rank = (n) => (/^seed-/.test(n) ? 0 : /^BPSC_Senior/.test(n) ? 2 : 1);
    return rank(a) - rank(b);
  });
  let all = [];
  for (const f of files) {
    try {
      const src = fs.readFileSync(path.join(MOBILE, f), 'utf8');
      const docs = parseFile(src);
      all = all.concat(docs.map((d, i) => finalize(d, all.length + i)));
      console.log(`  ${f}: ${docs.length} rows`);
    } catch (e) {
      console.error(`  ${f}: ERROR ${e.message}`);
    }
  }
  const usable = all.filter(Boolean);

  const seen = new Set();
  const unique = [];
  for (const q of usable) {
    const key = q.question.toLowerCase().slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }

  const bank = allocateBalanced(unique, MAX_DOCS);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(bank));
  console.log(`\nWrote ${bank.length} questions -> ${OUT}`);
  console.log('Per-category:', bank.reduce((acc, q) => { acc[q.category] = (acc[q.category] || 0) + 1; return acc; }, {}));
}

main();