const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, list);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      const matches = [];
      lines.forEach((l, idx) => {
        if (l.includes('fetchUnseenQuestions') || l.includes('questions') || l.includes('rpc') || l.includes('startExam')) {
          matches.push(`${idx + 1}: ${l.trim()}`);
        }
      });
      list.push({ file: p, matches });
    }
  });
  return list;
}

const list = [];
['app', 'src', 'lib'].forEach(d => walk(d, list));
fs.writeFileSync('check_results.json', JSON.stringify(list, null, 2));
console.log('Done scanning files.');
