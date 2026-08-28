// Generate SQL to import bangla_claude.json into Supabase questions table.
const fs = require('fs'), path = require('path');
const rows = require('../artifacts/mobile/src/data/bangla_claude.json');
const esc = s => String(s==null?'':s).replace(/'/g, "''");
const lines = [];
lines.push('begin;');
for (const r of rows) {
  lines.push(`insert into questions (category, subcategory, exam_type, subject, chapter, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, importance, active)
values ('${esc(r.category)}','${esc(r.subcategory)}','${esc(r.exam_type)}','${esc(r.subject)}','${esc(r.chapter)}','${esc(r.question)}','${esc(r.option_a)}','${esc(r.option_b)}','${esc(r.option_c)}','${esc(r.option_d)}','${esc(r.correct_answer)}','${esc(r.explanation)}','${esc(r.difficulty)}',${r.importance},true);`);
}
lines.push('commit;');
const dest = path.resolve(__dirname,'../artifacts/mobile/src/data/import_bangla_claude.sql');
fs.writeFileSync(dest, lines.join('\n'), 'utf8');
console.log('WROTE', dest, 'inserts=', rows.length);
// summary
const by = {}; for (const r of rows) by[r.subcategory]=(by[r.subcategory]||0)+1;
console.log(JSON.stringify(by));