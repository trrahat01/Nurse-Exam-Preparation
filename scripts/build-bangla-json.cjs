// Convert Claude-generated Bangla MCQs (from Mcq data/*.xlsx) into app schema JSON.
const fs = require('fs'), path = require('path');
const all = require('../tmp-xlsx/all-unique.json');

// map xlsx category -> your requested subcategory
const MAP = {
  'synonym':'Synonyms', 'antonym':'Antonyms', 'vocabulary':'Vocabulary',
  'idiom':'Idioms', 'one_word':'One Word', 'author_book':'Literature',
  'sentence_type':'Grammar', 'tense':'Grammar', 'pos':'Grammar', 'samas':'Grammar'
};

const rows = [];
for (const r of all) {
  const sub = MAP[r.cat] || 'Literature';
  rows.push({ category:'Bangla', subcategory:sub, exam_type:'bpsc', subject:'Bangla',
    chapter: sub, question:r.q, option_a:r.a, option_b:r.b, option_c:r.c, option_d:r.d,
    correct_answer:r.ans, explanation:'', difficulty:'medium', importance:3, active:true });
}

// dedupe by question+correct
const seen = new Map();
for (const r of rows) seen.set(r.question.trim()+'|'+r.correct_answer.trim(), r);
const out = [...seen.values()];

const dest = path.resolve(__dirname,'../artifacts/mobile/src/data/bangla_claude.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 0), 'utf8');
const by = {};
for (const r of out) by[r.subcategory]=(by[r.subcategory]||0)+1;
console.log('WROTE', dest, 'rows=', out.length);
console.log('by subcategory:', JSON.stringify(by, null, 2));