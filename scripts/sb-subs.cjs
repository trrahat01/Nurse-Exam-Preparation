// Print distinct subcategory values per category from Supabase.
const K = require(process.argv[2]).SUPABASE_ANON_KEY;
const U = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
(async () => {
  for (const cat of ['Nursing', 'Bangla', 'English', 'General Knowledge']) {
    const subs = {};
    let offset = 0;
    for (;;) {
      const r = await fetch(U + `/rest/v1/questions?select=subcategory&category=eq.${encodeURIComponent(cat)}&offset=${offset}&limit=1000`, {
        headers: { apikey: K, Authorization: 'Bearer ' + K },
      });
      const arr = await r.json();
      if (!Array.isArray(arr) || arr.length === 0) break;
      arr.forEach(x => { const s = x.subcategory || '(null)'; subs[s] = (subs[s] || 0) + 1; });
      offset += arr.length;
      if (arr.length < 1000) break;
    }
    console.log('\n=== ' + cat + ' ===');
    console.log(Object.entries(subs).map(([k, v]) => `${v}\t${k}`).join('\n'));
  }
})().catch(e => console.log('ERR', e.message));