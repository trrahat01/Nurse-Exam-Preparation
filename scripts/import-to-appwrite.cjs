/**
 * Import 40,000 questions from the local SQL files into Appwrite.
 * Prereq: npm install node-appwrite  (run in artifacts/mobile)
 * Run:   node ../../scripts/import-to-appwrite.js
 */
const fs = require('fs');
const path = require('path');
const LOCAL_APPWRITE = path.resolve(__dirname, '..', 'artifacts', 'mobile', 'node_modules', 'node-appwrite');
function loadAppwrite() {
  try { return require('node-appwrite'); } catch { return require(LOCAL_APPWRITE); }
}
const { Client, Databases, ID } = loadAppwrite();

const ENDPOINT   = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT   || 'https://tor.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a7f8d46003d6384946a';
const DATABASE_ID   = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID   || '6a7fb93d003c66502e27';
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLL_QUESTIONS || 'questions';
// Use a fresh (rotated) server key:
const API_KEY = process.env.APPWRITE_SERVER_KEY || '';

function unescapeSql(v) {
  const s = String(v).replace(/^'(.*)'$/, '$1').replace(/''/g, "'");
  return s === 'NULL' ? '' : s;
}

function splitOutsideQuotes(line) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'") { if (line[i + 1] === "'") { cur += "'"; i++; } else { q = !q; } continue; }
    if (c === ',' && !q) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseSql(content) {
  const rows = [];
  const re = /INSERT\s+INTO\s+public\.questions\s*\([^)]*\)\s*VALUES\s*((?:\([^;]+\);?)+)/gmis;
  let m;
  while ((m = re.exec(content)) !== null) {
    const block = m[1];
    for (const pm of block.match(/\([^;]*?\)[,;]?/gs) || []) {
      const body = pm.replace(/^\(/, '').replace(/\);?$/, '').trim();
      if (!body) continue;
      const c = splitOutsideQuotes(body);
      if (c.length < 12) continue;
      const tags = (() => { try { return JSON.parse(unescapeSql(c[15] || '[]')); } catch { return []; } })();
      rows.push({
        category: unescapeSql(c[1]), subcategory: unescapeSql(c[2]), exam_type: unescapeSql(c[3]) || 'bpsc',
        subject: unescapeSql(c[4]), chapter: unescapeSql(c[5]), question: unescapeSql(c[6]),
        option_a: unescapeSql(c[7]), option_b: unescapeSql(c[8]), option_c: unescapeSql(c[9]), option_d: unescapeSql(c[10]),
        correct_answer: unescapeSql(c[11]).toLowerCase(), explanation: unescapeSql(c[12]),
        difficulty: unescapeSql(c[13]) || 'medium', importance: parseInt(unescapeSql(c[14]) || '3') || 3,
        tags, language: unescapeSql(c[16]) || 'english', active: true,
      });
    }
  }
  return rows;
}
async function main() {
  if (!API_KEY) { console.error('Set APPWRITE_SERVER_KEY to a fresh server key.'); process.exit(1); }
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
  const databases = new Databases(client);

  const dir = path.resolve(__dirname, '..', '..', 'artifacts', 'mobile');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
  console.log('SQL files:', files);

  let all = [];
  for (const f of files) {
    const rows = parseSql(fs.readFileSync(path.join(dir, f), 'utf8'));
    console.log(`  ${f}: ${rows.length}`);
    all = all.concat(rows);
  }
  console.log(`\nTotal to import: ${all.length}`);

  const BATCH = 100;
  let count = 0;
  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH);
    await Promise.all(batch.map(r => databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), r)));
    count += batch.length;
    console.log(`  uploaded ${count} / ${all.length}`);
  }
  console.log('Import complete ✅');
}

main().catch(e => { console.error('Import failed:', e.message); process.exit(1); });