const fs = require('fs'), path = require('path');
const XLSX = require(path.resolve(__dirname,'../tmp-xlsx/node_modules/xlsx'));
const dir = path.resolve(__dirname,'../Mcq data');

function loadXlsx(p){
  const wb = XLSX.readFile(p);
  const out = [];
  for (const s of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[s], {header:1});
    for (let i=1;i<rows.length;i++){
      const r = rows[i]; if(!r || !r.length) continue;
      out.push({ file: path.basename(p), id: r[0], cat: String(r[1]||'').trim(),
        q: String(r[2]||'').trim(), a: String(r[3]||'').trim(), b: String(r[4]||'').trim(),
        c: String(r[5]||'').trim(), d: String(r[6]||'').trim(), ans: String(r[7]||'').trim() });
    }
  }
  return out;
}
// ---- per-file category + row counts ----
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.xlsx')).sort();
let grand = new Map();
for (const f of files){
  const rows = loadXlsx(path.join(dir,f));
  const cats = {};
  for (const r of rows) cats[r.cat] = (cats[r.cat]||0)+1;
  console.log(f, 'rows=', rows.length, 'cats=', JSON.stringify(cats));
}
// ---- dedup all across all files by normalized question+answer ----
const all = [];
for (const f of files) all.push(...loadXlsx(path.join(dir,f)));
const norm = s => s.replace(/\s+/g,' ').trim();
const seen = new Map();
for (const r of all) seen.set(norm(r.q)+'|'+norm(r.ans), r);
console.log('UNIQUE (by q+correct) across all xlsx:', seen.size);
// category distribution of unique
const uc = {}; for (const v of seen.values()) uc[v.cat]=(uc[v.cat]||0)+1;
console.log('unique cats:', JSON.stringify(uc));
// completeness check
let incomplete=0; for (const v of seen.values()){ if(!v.q||!v.a||!v.b||!v.c||!v.d||!v.ans) incomplete++; }
console.log('incomplete rows:', incomplete);
fs.writeFileSync(path.join(__dirname,'../tmp-xlsx/all-unique.json'), JSON.stringify([...seen.values()],null,2));
console.log('wrote all-unique.json count=', seen.size);