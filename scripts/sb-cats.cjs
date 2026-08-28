// Print distinct category values + counts from Supabase.
const K = require(process.argv[2]).SUPABASE_ANON_KEY;
const U = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
(async () => {
  const out = {};
  let offset = 0;
  for (;;) {
    const r = await fetch(U + `/rest/v1/questions?select=category&offset=${offset}&limit=1000`, {
      headers: { apikey: K, Authorization: 'Bearer ' + K },
    });
    const arr = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    arr.forEach(x => { const c = x.category || '(null)'; out[c] = (out[c] || 0) + 1; });
    offset += arr.length;
    if (arr.length < 1000) break;
  }
  console.log(JSON.stringify(out, null, 2));
})().catch(e => console.log('ERR', e.message));