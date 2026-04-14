import fs from 'fs';
import path from 'path';

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'build') return;
        
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                searchDir(fullPath);
            } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.css')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('padStart(5')) {
                    console.log('FOUND IN:', fullPath);
                    const lines = content.split('\n');
                    lines.forEach((l, i) => { if(l.includes('padStart(5')) console.log(`  Line ${i+1}: ${l.trim()}`); });
                }
            }
        } catch(e) {}
    });
}

searchDir('c:/xampp/htdocs/santé saas/monolithique');
console.log('Search finished.');
