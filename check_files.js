// Script to check for files related to the queries and mock data issue

const fs = require('fs');
const path = require('path');

function checkForFiles() {
    const baseDir = 'd:/React Native/Nurse Exam Preparation';
    
    console.log('Base directory:', baseDir);
    console.log('\n=== Checking lib directory structure ===');
    
    // Check lib subdirectories
    const libDir = path.join(baseDir, 'lib');
    if (fs.existsSync(libDir)) {
        const libSubdirs = ['api-client-react', 'api-spec', 'api-zod', 'db'];
        libSubdirs.forEach(subdir => {
            const subdirPath = path.join(libDir, subdir);
            if (fs.existsSync(subdirPath)) {
                console.log('\n  --- Directory: ' + subdir);
                const files = fs.readdirSync(subdirPath);
                files.forEach(file => {
                    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                        console.log('    - ' + file);
                        if (file.toLowerCase().includes('queries') || file.toLowerCase().includes('mock')) {
                            try {
                                const content = fs.readFileSync(path.join(subdirPath, file), 'utf8');
                                console.log('      Content preview:', content.substring(0, 500));
                            } catch (err) {
                                console.log('      Error reading file:', err.message);
                            }
                        }
                    }
                });
            }
        });
    }
    
    console.log('\n=== Checking src directory ===');
    const srcDir = path.join(baseDir, 'src');
    if (fs.existsSync(srcDir)) {
        const srcContents = fs.readdirSync(srcDir);
        srcContents.forEach(item => {
            console.log('  -', item);
            
            // Check src/queries directory
            if (item === 'queries') {
                const srcQueriesDir = path.join(srcDir, item);
                if (fs.existsSync(srcQueriesDir)) {
                    console.log('    Subdirectory: queries');
                    const queryFiles = fs.readdirSync(srcQueriesDir);
                    queryFiles.forEach(queryFile => {
                        if (queryFile.endsWith('.ts') || queryFile.endsWith('.tsx')) {
                            console.log('      - ' + queryFile);
                            if (queryFile.toLowerCase().includes('queries') || queryFile.toLowerCase().includes('mock')) {
                                try {
                                    const content = fs.readFileSync(path.join(srcQueriesDir, queryFile), 'utf8');
                                    console.log('        Content preview:', content.substring(0, 500));
                                } catch (err) {
                                    console.log('        Error reading file:', err.message);
                                }
                            }
                        }
                    });
                }
            }
        });
    } else {
        console.log('src directory not found');
    }
}

function checkQueriesFiles() {
    const baseDir = 'd:/React Native/Nurse Exam Preparation';
    const srcDir = path.join(baseDir, 'src', 'queries');
    
    if (fs.existsSync(srcDir)) {
        console.log('\n=== Detailed check of src/queries directory ===');
        const queryFiles = fs.readdirSync(srcDir);
        
        console.log('Files in src/queries:');
        queryFiles.forEach(file => {
            console.log('  - ' + file);
            
            // Check if it's a file (not directory)
            const filePath = path.join(srcDir, file);
            if (fs.statSync(filePath).isFile()) {
                console.log('    Type: File');
                if (file.toLowerCase().includes('queries') || file.toLowerCase().includes('mock')) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        console.log('    Content preview:', content.substring(0, 500));
                    } catch (err) {
                        console.log('    Error reading file:', err.message);
                    }
                }
            } else {
                console.log('    Type: Directory');
                // Explore subdirectories
                exploreDirectory(filePath, '');
            }
        });
        
        // Check for specific files mentioned in the issue
        const targetFiles = ['queries.ts', 'mockData.ts'];
        
        console.log('\n=== Checking for specific target files ===');
        targetFiles.forEach(file => {
            const filePath = path.join(srcDir, file);
            if (fs.existsSync(filePath)) {
                console.log('\nFound: ' + file);
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    console.log('Content:');
                    console.log(content);
                } catch (err) {
                    console.log('Error reading file:', err.message);
                }
            } else {
                console.log(file + ' not found');
            }
        });
        
        // Check for circular import in src/lib/queries.ts (if it exists)
        const srcLibQueriesPath = path.join(srcDir, 'lib/queries.ts');
        if (fs.existsSync(srcLibQueriesPath)) {
            console.log('\nFound: src/lib/queries.ts (checking for circular import)');
            try {
                const content = fs.readFileSync(srcLibQueriesPath, 'utf8');
                console.log('Content:');
                console.log(content);
                
                // Check for circular import
                if (content.includes('../src/lib/queries')) {
                    console.log('\n⚠️  CIRCULAR IMPORT DETECTED: src/lib/queries.ts imports from ../src/lib/queries');
                }
            } catch (err) {
                console.log('Error reading file:', err.message);
            }
        }
    }
}

function exploreDirectory(dirPath, indent) {
    try {
        const items = fs.readdirSync(dirPath);
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                console.log(indent + '  - ' + item + ' (directory)');
                exploreDirectory(itemPath, indent + '    ');
            } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
                console.log(indent + '  - ' + item + ' (TypeScript file)');
                if (item.toLowerCase().includes('queries') || item.toLowerCase().includes('mock')) {
                    try {
                        const content = fs.readFileSync(itemPath, 'utf8');
                        console.log(indent + '    Content preview:', content.substring(0, 500));
                    } catch (err) {
                        console.log(indent + '    Error reading file:', err.message);
                    }
                }
            }
        });
    } catch (err) {
        console.log(indent + 'Error exploring directory:', err.message);
    }
}

checkForFiles();
checkQueriesFiles();