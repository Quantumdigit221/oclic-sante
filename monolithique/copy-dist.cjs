const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'frontend', 'dist');
const dest = path.join(__dirname, 'public');

function copyDir(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    const items = fs.readdirSync(from);
    for (const item of items) {
        const srcPath = path.join(from, item);
        const destPath = path.join(to, item);
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Copying frontend dist to public...');
copyDir(src, dest);
console.log('✅ Done!');
