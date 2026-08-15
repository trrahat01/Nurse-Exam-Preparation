/**
 * Import questions from local SQL files (tables `questions` or `mcqs`) into Appwrite.
 * Handles both schemas by reading each INSERT's column header and normalizing names.
 *
 * Prereq:  node-appwrite is installed in artifacts/mobile
 * Run:     cd artifacts/mobile  &&  node ../../scripts/import-to-appwrite.cjs
 */
const fs = require('fs');
const path = require('path');

function loadAppwrite() {
  const LOCAL = path.resolve(__dirname, '..', 'artifacts', 'mobile', 'node_modules', 'node-appwrite');
  try { return require('node-appwrite'); } catch { return require(LOCAL); }
}
const { Client, Databases, ID } = loadAppwrite();

const ENDPOINT     = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT   || 'https://tor.cloud.appwrite.io/v1';
const PROJECT_ID   = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a7f8d46003d6384946a';
const DATABASE_ID  = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '6a7fb93d003c66502e27';
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLL_QUESTIONS || 'questions';
const API_KEY = process.env.APPWRITE_SERVER_KEY || '';

// ─────────────────────────── SQL parsing helpers ───────────────────────────

/** Split SQL text into statements at top-level ';' (ignores ';' inside quotes). */
function splitStatements(sql) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'") {
      if (sql[i + 1] === "'") { cur += "''"; i++; continue; }
      q = !q;
    }
    if (!q && c === ';') { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Split a single INSERT's VALUES into top-level parenthesized row bodies. */
function rowBodies(rest) {
  const rows = [];
  let i = 0;
  while (i < rest.length) {
    while (i < rest.length && rest[i] !== '(') i++;
    if (i >= rest.length) break;
    let depth = 0, q = false, start = i;
    for (; i < rest.length; i++) {
      const c = rest[i];
      if (c === "'") { if (rest[i + 1] === "'") { i++; continue; } q = !q; continue; }
      if (!q && c === '(') depth++;
      if (!q && c === ')') { depth--; if (depth === 0) { i++; break; } }
    }
    const body = rest.slice(start + 1, i - 1).trim();
    if (body && body.length > 2) rows.push(body);
  }
  return rows;
}

/** Split a row body into cells, honoring single-quoted strings + '' escapes. */
function splitCells(body) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "'") {
      if (body[i + 1] === "'") { cur += "'"; i++; continue; }
      q = !q;
      continue;
    }
    if (!q && c === ',') { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim() !== '') out.push(cur.trim());
  return out;
}

function unescape(v) {
  const s = v.replace(/^'(.*)'$/, '$1');
  if (/^'(.*)'$/.test(v)) return s.replace(/''/g, "'");
  if (v === 'NULL') return '';
  // leave numbers/booleans as-is (unquoted)
  return v;
}

function toBool(v) {
  return /^(true|t|1|yes)$/i.test(String(v));
}

function toTags(v) {
  if (Array.isArray(v)) return v;
  const s = String(v);
  if (!s || s === 'NULL') return [];
  try { const p = JSON.parse(s); if (Array.isArray(p)) return p.map(x => String(x).replace(/^'|'$/g, '')); } catch {}
  return s.trim() === '' ? [] : s.split(',').map(x => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
}

/** Normalize a source column name to the app's target attribute key. */
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
};

function buildRow(cols, cells) {
  const doc = {};
  for (let k = 0; k < cols.length; k++) {
    const target = COL_MAP[cols[k].toLowerCase()];
    if (!target) continue;
    const raw = cells[k] != null ? cells[k] : '';
    const v = unescape(raw);
    if (v === '' || v === 'NULL') continue;
    if (target === 'correct_answer') doc[target] = String(v).toLowerCase();
    else if (target === 'tags') doc[target] = toTags(v);
    else if (target === 'active' || target === 'verified') doc[target] = toBool(v);
    else if (target === 'importance') doc[target] = parseInt(v, 10) || 3;
    else doc[target] = v;
  }
  // provide sensible defaults so the app always has sortable/groupable fields
  if (!doc.question) return null;
  doc.category = doc.category || 'General';
  doc.subcategory = doc.subcategory || 'General';
  doc.exam_type = doc.exam_type || 'bpsc';
  doc.language = doc.language || 'english';
  doc.difficulty = doc.difficulty || 'medium';
  doc.active = doc.active == null ? true : doc.active;
  doc.importance = doc.importance || 3;
  return doc;
}
const INSERT_RE = /^\s*INSERT\s+INTO\s+(?:public\.)?(mcqs|questions)\s*\(([^()]*)\)\s*VALUES?/i;

/** Return a list of document objects parsed from one file (paren-balanced scan). */
function parseFile(content) {
  const docs = [];
  const re = /INSERT\s+INTO\s+(?:public\.)?(mcqs|questions)\s*\(/gi;
  let m;
  let matchedStmts = 0;
  while ((m = re.exec(content)) !== null) {
    const after = content.indexOf(')', m.index + m[0].length);
    if (after < 0) break;
    const cols = content.slice(m.index + m[0].length, after).split(',').map(c => c.trim().toLowerCase());
    const vIdx = content.toUpperCase().indexOf('VALUES', after);
    if (vIdx < 0) { re.lastIndex = after + 1; continue; }
    matchedStmts++;
    let i = vIdx + 6;
    let rowsThisStmt = 0;
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
          if (doc) { docs.push(doc); rowsThisStmt++; }
        }
      } else break;
      // after a closed row, look for statement terminator ';' outside quotes
      let j = i;
      while (j < content.length && /[,\s]/.test(content[j])) j++;
      if (content[j] === ';') { re.lastIndex = j + 1; break; }
    }
    if (rowsThisStmt === 0) re.lastIndex = i + 1; // safety against infinite loop
  }
  return { docs, matchedStmts };
}

/** Auto-create the `questions` collection (small schema) so Appwrite accepts documents.
 *  Appwrite caps the TOTAL size of a collection's string attributes, so we keep it lean. */
async function ensureSchema(dbs) {
  // 0) optional forced rebuild: delete the (often over-limit) collection first
  if (process.env.RESET_COLLECTION === '1') {
    try {
      await dbs.deleteCollection(DATABASE_ID, COLLECTION_ID);
      console.log('Deleted existing "questions" collection (reset).');
    } catch (e) {
      console.error('  ⚠ RESET deleteCollection failed:', (e.message || '').slice(0, 140));
    }
  }
  // 1) create the collection if it doesn't exist yet
  let exists = true;
  try { await dbs.getCollection(DATABASE_ID, COLLECTION_ID); }
  catch (e) { exists = false; }
  if (!exists) {
    console.log('Creating collection:', COLLECTION_ID);
    try {
      await dbs.createCollection(DATABASE_ID, COLLECTION_ID, 'Questions', [
        'create("any")', 'read("any")', 'update("any")', 'delete("any")',
      ]);
    } catch (ce) { console.error('  createCollection failed:', (ce.message || '').slice(0, 160)); }
  }

  // 2) add attributes (idempotent)
  const existing = new Set();
  try {
    const res = await dbs.listAttributes(DATABASE_ID, COLLECTION_ID);
    (res.attributes || []).forEach(a => existing.add(a.key));
  } catch (e) { console.error('  listAttributes:', (e.message || '').slice(0, 120)); }

  const spec = [
    ['category', 'string', 150, true], ['subcategory', 'string', 150, true],
    ['subject', 'string', 150, false], ['chapter', 'string', 150, false],
    ['exam_type', 'string', 30, true], ['difficulty', 'string', 10, false],
    ['language', 'string', 30, false],
    ['question', 'string', 2000, true],
    ['option_a', 'string', 1000, true], ['option_b', 'string', 1000, true],
    ['option_c', 'string', 1000, true], ['option_d', 'string', 1000, true],
    ['correct_answer', 'string', 20, true], ['explanation', 'string', 2000, false],
    ['importance', 'integer', 0, false],
    ['active', 'boolean', 0, false], ['verified', 'boolean', 0, false],
  ];
  for (const [key, type, size, req] of spec) {
    if (existing.has(key)) continue;
    try {
      if (type === 'string') await dbs.createStringAttribute(DATABASE_ID, COLLECTION_ID, key, size, req);
      else if (type === 'integer') await dbs.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, key, req);
      else if (type === 'boolean') await dbs.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, key, req);
      console.log('  created attribute:', key);
    } catch (e) {
      const msg = String(e.message || '');
      if (/already exists|duplicate/i.test(msg)) existing.add(key);
      else {
        console.error('  FAILED attribute ' + key + ': ' + msg.slice(0, 120));
        if (/maximum|limit|size|index/i.test(msg)) {
          console.error('  ❌ Collection is over Appwrite\'s attribute-size limit. Delete the "questions" collection in the Appwrite console, then rerun this script (it will recreate it).');
          process.exit(1);
        }
      }
    }
  }

  // wait for attributes to become available before writing documents
  for (let n = 0; n < 40; n++) {
    let ready = true;
    try {
      const res = await dbs.listAttributes(DATABASE_ID, COLLECTION_ID);
      const status = {};
      (res.attributes || []).forEach(a => status[a.key] = a.status);
      for (const [key] of spec) if (status[key] && status[key] !== 'available') ready = false;
    } catch { ready = false; }
    if (ready) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  // 3) indexes the app's queries rely on (equal filters + fulltext search)
  const indexDefs = [
    ['idx_category', 'key', ['category']],
    ['idx_subcategory', 'key', ['subcategory']],
    ['idx_exam_type', 'key', ['exam_type']],
    ['idx_question', 'fulltext', ['question']],
  ];
  for (const [key, type, attrs] of indexDefs) {
    try { await dbs.createIndex(DATABASE_ID, COLLECTION_ID, key, type, attrs); console.log('  created index:', key); }
    catch (e) { if (!/already exists|duplicate/i.test(String(e.message || ''))) console.error('  index ' + key + ': ' + (e.message || '').slice(0, 120)); }
  }
}

async function main() {
  if (!API_KEY || /<|>/i.test(API_KEY)) {
    console.error('❗ Set APPWRITE_SERVER_KEY to a real API key (Settings -> API Keys -> Create, scope: databases.documents.create + read).');
    process.exit(1);
  }
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
  const databases = new Databases(client);

  console.log('Ensuring questions collection schema...');
  await ensureSchema(databases);
  console.log('Schema ready. Uploading documents...\n');

  const dir = path.resolve(__dirname, '..', 'artifacts', 'mobile');
  const only = process.env.SINGLE_FILE;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql') && (!only || f === only));
  console.log('SQL files:', files);

  let all = [];
  for (const f of files) {
    if (/schema/i.test(f)) { console.log(`  ${f}: skipped (schema only)`); continue; }
    try {
      const { docs, matchedStmts } = parseFile(fs.readFileSync(path.join(dir, f), 'utf8'));
      console.log(`  ${f}: ${docs.length} questions (${matchedStmts} INSERT stmts)`);
      all = all.concat(docs);
    } catch (e) {
      console.log(`  ${f}: ERROR ${e.message}`);
    }
  }

  console.log(`\nTotal questions to import: ${all.length}`);
  if (all.length === 0) { console.log('Nothing to import (check INSERT format).'); return; }
  if (process.env.ONLY_COUNT) { console.log('Count-only mode: not uploading.'); return; }

  const BATCH = 100;
  let ok = 0, fail = 0;
  const t0 = Date.now();
  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH);
    await Promise.all(batch.map(async (d) => {
      try { await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), d); ok++; }
      catch (e) { fail++; if (fail <= 5) console.error(`    [err] ${e.message}`); }
    }));
    console.log(`  uploaded ${ok} ok / ${fail} fail (${Math.min(i + BATCH, all.length)}/${all.length}) — ${Math.round((Date.now() - t0) / 1000)}s`);
  }

  console.log(`\nDONE — ${ok} created, ${fail} failed.`);
  if (fail > 0) console.log('If failures are "attribute is unknown", tell me the error + your questions collection attributes.');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });