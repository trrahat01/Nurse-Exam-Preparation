const fs = require('fs'), path = require('path');
const XLSX = require(path.resolve(__dirname,'../tmp-xlsx/node_modules/xlsx'));
const dir = path.resolve(__dirname,'../Mcq data');
function utf8Read(p){ return fs.readFileSync(p,'utf8'); }
// ---- survey all files ----
for (const f of fs.readdirSync(dir).sort()) {
  const p = path.join(dir, f);
  if (f.endsWith('.csv')) {
    const rows = utf8Read(p).split(/\r?\n/).filter(l=>l.trim());
    console.log('=== CSV', f, 'lines=', rows.length);
    console.log('HEADER:', rows[0]);
    // category distribution
    const cats = {};
    for (let i=1;i<rows.length;i++){ const c = rows[i].split(',').map(s=>s.trim()); const cat = c[0]; cats[cat]=(cats[cat]||0)+1; }
    console.log('category counts:', JSON.stringify(cats));
    console.log('sample row1:', rows[1]);
    console.log('sample row2:', rows[2]);
  } else if (f.endsWith('.xlsx')) {
    const wb = XLSX.readFile(p);
    for (const sname of wb.SheetNames) {
      const ws = wb.Sheets[sname];
      const rows = XLSX.utils.sheet_to_json(ws, {header:1});
      console.log('=== XLSX:', f, 'sheet=', sname, 'rows=', rows.length);
      console.log('HEADER:', JSON.stringify(rows[0]));
      for (let i=1;i<Math.min(4,rows.length);i++) console.log('  r'+i+':', JSON.stringify(rows[i]));
    }
  }
}