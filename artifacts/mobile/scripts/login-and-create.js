const https = require('https');
const fs = require('fs');

const EMAIL = 'trrahat03@gmail.com';
const PASSWORD = '/ieFm,D7xEMK_?&';

// Step 1: Login
const loginQuery = JSON.stringify({
  query: `mutation { login(input: { email: "${EMAIL}", password: "${PASSWORD}" }) { session { secret } } }`
});

const loginOptions = {
  hostname: 'api.expo.dev',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginQuery)
  }
};

const loginReq = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    console.log('Login Response:', body);
    
    try {
      const json = JSON.parse(body);
      const token = json.data?.login?.session?.secret;
      if (token) {
        console.log('TOKEN:', token);
        // Save token
        fs.writeFileSync('expo-token.txt', token);
        
        // Step 2: Create project
        const projectQuery = JSON.stringify({
          query: 'mutation { projectCreate(input: {projectName: "Nurse-Exam-Prep-2026"}) { project { id slug name } } }'
        });
        
        const projectOptions = {
          hostname: 'api.expo.dev',
          path: '/graphql',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(projectQuery),
            'Authorization': 'Bearer ' + token
          }
        };
        
        const projectReq = https.request(projectOptions, (res2) => {
          let body2 = '';
          res2.on('data', chunk => body2 += chunk);
          res2.on('end', () => {
            console.log('Project Create Status:', res2.statusCode);
            console.log('Project Create Response:', body2);
            fs.writeFileSync('project-result.json', body2);
          });
        });
        projectReq.on('error', e => console.error('Project Error:', e.message));
        projectReq.write(projectQuery);
        projectReq.end();
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});
loginReq.on('error', e => console.error('Login Error:', e.message));
loginReq.write(loginQuery);
loginReq.end();