// Script to search for mock data references and queries files
const fs = require('fs');
const path = require('path');

function listFiles(dir, indent = '') {
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'node_modules' || item === '.git' || item === '.npm' || item === '.replit') continue;
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
                console.log(indent + '- ' + item + '/');
                listFiles(itemPath, indent + '  ');
            } else {
                console.log(indent + '- ' + item);
            }
        }
    } catch (err) {
        console.log(indent + 'Error: ' + err.message);
    }
}

const baseDir = 'd:/React Native/Nurse Exam Preparation';
console.log('=== Full project structure ===');

// List all files in artifacts directory
console.log('\n--- artifacts/ ---');
listFiles(path.join(baseDir, 'artifacts'));

console.log('\nDone.');