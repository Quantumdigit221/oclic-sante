import fs from 'fs';
import path from 'path';

const filePath = 'c:/xampp/htdocs/santé saas/monolithique/public/assets/index-Cg4yQY5E.js';
try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('Original size:', content.length);
    
    // The bug logic was: 
    // .map(t => t.amount.toString().padStart(5, '0')).join('.00') + '.00 FCFA'
    
    // We search for a part of it that is unique
    const pattern = /\.map\(([a-zA-Z])=>\1\.amount\.toString\(\)\.padStart\(5,"0"\)\)\.join\("\.00"\)/;
    const match = content.match(pattern);
    
    if (match) {
        console.log('BUG DETECTED in index-Cg4yQY5E.js!');
        console.log('Match:', match[0]);
        
        // Replacement: use reduce to get real sum
        // Instead of map(...).join(...), replace with .reduce((acc,curr)=>acc+Number(curr.amount||0),0)
        const param = match[1];
        const replacement = `.reduce((${param}sum,${param})=>${param}sum+Number(${param}.amount||0),0).toLocaleString('fr-FR')`;
        
        const newContent = content.replace(pattern, replacement);
        fs.writeFileSync(filePath, newContent);
        console.log('FIX APPLIED SUCCESSFULLY to index-Cg4yQY5E.js');
    } else {
        console.log('BUG PATTERN NOT FOUND with standard regex. Trying literal search...');
        // Try to find padStart(5, "0")
        if (content.includes('padStart(5,"0")')) {
            console.log('Found padStart pattern!');
            // We'll replace it with a more generic one
            const newContent = content.replace(/\.map\(([a-zA-Z])=>\1\.amount\.toString\(\)\.padStart\(5,"0"\)\)\.join\("\.00"\)/g, (m, p) => `.reduce((${p}sum,${p})=>${p}sum+Number(${p}.amount||0),0).toLocaleString('fr-FR')`);
            fs.writeFileSync(filePath, newContent);
            console.log('PATCHED ALL occurrences.');
        } else {
            console.log('REALLY NOT FOUND. Maybe it is slightly different?');
            // search for the 02000 string manually
            if (content.includes('02000.002000')) {
                 console.log('HARDCODED STRING FOUND!');
            }
        }
    }
} catch (e) {
    console.error('Error:', e.message);
}
