// Count question rows in the nursing SQL files by parsing INSERT INTO questions rows.
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '../artifacts/mobile');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql') && f !== 'supabase-schema.sql');
function countRows(sql) {
  // find INSERT INTO ... (authors) VALUES ... then count top-level ( ... , ... ) row bodies
  let total = 0;
  const re = /INSERT\s+INTO\s+[^\s(]+/gi;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const colsIdx = sql.indexOf('(', m.index + m[0].length);
    if (colsIdx < 0) continue;
    const vIdx = sql.toUpperCase().indexOf('VALUES', colsIdx);
    if (vIdx < 0) continue;
    let i = vIdx + 6, depth = 0, q = false, rows = 0;
    for (; i < sql.length; i++) {
      const c = sql[i];
      if (c === "'") { if (sql[i+1] === "'") { i++; continue; } q = !q; continue; }
      if (!q && c === '(') { if (depth === 0) rows++; depth++; }
      else if (!q && c === ')') depth--;
    }
    total += rows;
  }
  return total;
}
for (const f of files) {
  const sql = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log(f, '~', countRows(sql), 'rows');
}