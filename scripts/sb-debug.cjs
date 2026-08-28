// Test the EXACT Supabase read the app does (from src/lib/queries.ts),
// using the anon key from config.ts, to see why MCQs don't show.
const path = require('path');
const cfg = require(path.resolve(__dirname, '../artifacts/mobile/src/lib/config.ts'));
const K = cfg.SUPABASE_ANON_KEY;
const U = cfg.SUPABASE_URL;
(async () => {
  // replicate fetchQuestions({category:'Nursing'}, 20)
  let q = U + '/rest/v1/questions?select=*&limit=20' + '&category=eq.' + encodeURIComponent('Nursing');
  for (const [label, url] of [
    ['Nursing limit20', q],
    ['First 1 any', U + '/rest/v1/questions?select=*&limit=1'],
  ]) {
    try {
      const r = await fetch(url, { headers: { apikey: K, Authorization: 'Bearer ' + K } });
      const txt = await r.text();
      console.log('\n=== ' + label + ' status=' + r.status + ' ===');
      if (!r.ok) { console.log('ERR:', txt.slice(0, 300)); continue; }
      const arr = JSON.parse(txt);
      console.log('rows:', arr.length);
      if (arr[0]) {
        const row = arr[0];
        console.log('keys:', Object.keys(row).join(','));
        console.log('question:', (row.question||'').slice(0, 60));
        console.log('option_a:', (row.option_a||'').slice(0, 40));
        console.log('correct_answer:', row.correct_answer);
      }
    } catch (e) { console.log(label, 'NETERR', e.message); }
  }
})();