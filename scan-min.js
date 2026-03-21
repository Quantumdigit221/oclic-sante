import fs from 'fs';
import path from 'path';

const filePath = 'c:/xampp/htdocs/santé saas/monolithique/public/assets/index-Cg4yQY5E.js';
try {
    const content = fs.readFileSync(filePath, 'utf8');
    const searchString = "padStart(5"; // Or whatever part of it
    const index = content.indexOf(searchString);
    if (index !== -1) {
        console.log('FOUND at index:', index);
        console.log('Context:', content.substring(index - 100, index + 300));
    } else {
        console.log('NOT FOUND');
    }
    
    // Also search for the bad string
    const badString = "02000.002000";
    const badIndex = content.indexOf(badString);
    if (badIndex !== -1) {
        console.log('BAD STRING FOUND at index:', badIndex);
        console.log('Context:', content.substring(badIndex - 50, badIndex + 100));
    }
} catch (e) {
    console.error('Error:', e.message);
}
