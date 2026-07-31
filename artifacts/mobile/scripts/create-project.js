const https = require('https');
const fs = require('fs');

const query = JSON.stringify({
  query: 'mutation { projectCreate(input: {projectName: "Nurse-Exam-Prep-2026"}) { project { id slug name } } }'
});

const options = {
  hostname: 'api.expo.dev',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    fs.writeFileSync('project-result.json', body);
  });
});
req.on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});
req.write(query);
req.end();