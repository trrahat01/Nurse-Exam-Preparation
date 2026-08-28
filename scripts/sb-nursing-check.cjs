// Check how many Nursing (and total) MCQs exist in Supabase questions table.
const K = require(process.argv[2]).SUPABASE_ANON_KEY;
const U = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
function enc(s) { return encodeURIComponent(s); }
(async () => {
  const checks = [
    ['/rest/v1/questions?select=id&limit=1', 'total (limit1)'],
  ];
  // count exact: use the select=count with Prefer header
  try {
    const r = await fetch(U + '/rest/v1/questions?select=id', {
      headers: { apikey: K, Authorization: 'Bearer ' + K, Prefer: 'count=exact' },
    });
    const ct = r.headers.get('content-range');
    console.log('TOTAL questions:', ct || r.status);
  } catch (e) { console.log('TOTAL ERR', e.message); }

  for (const cat of ['Nursing', 'Bangla', 'English', 'General Knowledge']) {
    try {
      const q = U + '/rest/v1/questions?select=id&category=eq.' + enc(cat);
      const r = await fetch(q, { headers: { apikey: K, Authorization: 'Bearer ' + K, Prefer: 'count=exact' } });
      console.log('CAT', cat, '->', r.headers.get('content-range') || r.status, '| body:', (await r.text()).slice(0, 80));
    } catch (e) { console.log('CAT', cat, 'ERR', e.message); }
  }
})();