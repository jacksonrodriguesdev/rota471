const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
c = c.replace(/style="[^"]*"/g, '');
fs.writeFileSync('src/App.jsx', c);
console.log('Styles removed');
