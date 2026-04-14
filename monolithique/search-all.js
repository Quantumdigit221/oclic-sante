import fs from 'fs';
import path from 'path';

const dirPath = 'c:/xampp/htdocs/santé saas/monolithique/public';
const files = fs.readdirSync(dirPath);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const fullPath = path.join(dirPath, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('02000')) {
            console.log('FOUND IN:', file);
            // find exact line
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (line.includes('02000')) {
                    console.log(`- Line ${i + 1}: ${line.trim()}`);
                }
            });
        }
    }
});
