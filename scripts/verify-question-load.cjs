// Diagnostic: simulate the app's fetchQuestions/fallback logic against the
// real (broken) Appwrite questions collection to confirm questions now load.
const fs = require('fs');
const path = require('path');
const bank = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/mobile/src/data/offlineQuestions.json'), 'utf8'));

function map(d) {
  return {
    id: d.$id,
    question: d.question || '',
    option_a: d.option_a || '',
    option_b: d.option_b || '',
    option_c: d.option_c || '',
    option_d: d.option_d || '',
    correct_answer: d.correct_answer || '',
    category: d.category || '',
  };
}
function usable(q) {
  return !!(String(q.question || '').trim() &&
    (String(q.option_a || '').trim() || String(q.option_b || '').trim() ||
     String(q.option_c || '').trim() || String(q.option_d || '').trim()) &&
    /^[a-d]$/.test(String(q.correct_answer || '')));
}

const url = 'https://tor.cloud.appwrite.io/v1/databases/6a7fb93d003c66502e27/collections/questions/documents?limit=100';
fetch(url, { headers: { 'X-Appwrite-Project': '6a7f8d46003d6384946a', 'X-Appwrite-Response-Format': '1.6.0' } })
  .then((r) => r.json())
  .then((res) => {
    const remote = (res.documents || []).map(map);
    const usableRemote = remote.filter(usable);
    console.log('total in collection (reported by Appwrite):', res.total);
    console.log('remote docs fetched:', remote.length, '| usable remote questions:', usableRemote.length);
    const fallback = usableRemote.length ? usableRemote : bank.filter((q) => q.category === 'Nursing');
    console.log('questions the app will now show for "Nursing" practice:', fallback.length);
    if (fallback.length) {
      console.log('sample question shown:', JSON.stringify({
        question: fallback[0].question,
        option_a: fallback[0].option_a,
        answer: fallback[0].correct_answer,
        category: fallback[0].category,
        subcategory: fallback[0].subcategory,
      }));
    }
    console.log('truthful total the app reports (fetchTotalQuestionCount):', bank.length);
  })
  .catch((e) => console.log('ERR', e.message));