const fs = require('fs');

const app = fs.readFileSync('src/App.jsx', 'utf8');

// Function to extract content and replace in App.jsx
function extractComponent(name, startString, endString) {
    const startIndex = app.indexOf(startString);
    if (startIndex === -1) return null;
    
    // Find the end tag
    let endIndex = app.indexOf(endString, startIndex);
    if (endIndex === -1) return null;
    endIndex += endString.length;
    
    const content = app.substring(startIndex, endIndex);
    
    // Create component file
    const componentCode = `import React from 'react';\n\nexport default function ${name}() {\n  return (\n    <>\n      ${content}\n    </>\n  );\n}\n`;
    
    fs.mkdirSync('src/components', { recursive: true });
    fs.writeFileSync(`src/components/${name}.jsx`, componentCode);
    
    return { startIndex, endIndex, content };
}

// 1. Header
const header = extractComponent('Header', '<header', '</header>');
// 2. Footer
const footer = extractComponent('Footer', '<footer', '</footer>');
// 3. Hero (inicio + sticky bar)
// The hero ends where financiamento begins, or just the first two sections
const hero = extractComponent('Hero', '<section className="relative', '</section>\n<section className="py-16 bg-surface');
// 4. Financing
const financing = extractComponent('Financing', '<section className="py-16 bg-surface', '</section>\n<section className="py-16 bg-surface-container');
// 5. Catalog
const catalog = extractComponent('Catalog', '<section className="py-16 bg-surface-container', '</section>\n</main>');

console.log('Extraction complete. Files generated in src/components/');
