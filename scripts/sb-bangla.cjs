const path = require('path');
const SDK = require(path.resolve(__dirname, '../artifacts/mobile/node_modules/@supabase/supabase-js'));
const cfg = require(path.resolve(__dirname, '../artifacts/mobile/src/lib/config.ts'));
const sb = SDK.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

(async () => {
  // Bangla subcategories + a couple sample rows per subcategory
  const cats = {};
  let offset = 0;
  for (;;) {
    const { data, error } = await sb.from('questions').select('subcategory,question').eq('category','Bangla').range(offset, offset+999);
    if (error) { console.log('ERR', error.message); break; }
    if (!data || !data.length) break;
    for (const r of data) { const s = r.subcategory || '(null)'; cats[s] = (cats[s]||0)+1; }
    offset += 1000;
    if (data.length < 1000) break;
  }
  console.log('Bangla subcategory counts:', JSON.stringify(cats, null, 2));

  // sample 2 questions from each subcategory
  for (const s of Object.keys(cats)) {
    const { data } = await sb.from('questions').select('question,option_a,correct_answer').eq('category','Bangla').eq('subcategory', s).limit(2);
    console.log('\n--- ' + s + ' ---');
    for (const r of data || []) console.log('  Q:', (r.question||'').slice(0,80), '| A:', (r.option_a||'').slice(0,30));
  }
})().catch(e=>console.log('FATAL', e.message));