const fs = require('fs');

const overviewFile = 'src/pages/admin/Overview.jsx';
let overviewCode = fs.readFileSync(overviewFile, 'utf8');

// Find the section id="marcas-montadoras"
const searchStr = '{/* SECTION 1: GERENCIADOR DE MARCAS & MONTADORAS */}';

const splitIndex = overviewCode.indexOf(searchStr);

if (splitIndex !== -1) {
  let overviewPart = overviewCode.substring(0, splitIndex);
  let marcasPart = overviewCode.substring(splitIndex);

  // We need to cut off at the end of the Marcas section. Since this is the end of the file in Overview (because Cadastro was extracted), we can just take the rest of it until `</main>` or `</>`.
  const endTag = '</main>\n</>\n  );\n}';
  const endTag2 = '</>\n  );\n}';
  
  let endIndex = marcasPart.lastIndexOf('</main>');
  if (endIndex === -1) {
      endIndex = marcasPart.lastIndexOf('</>');
  }

  if (endIndex !== -1) {
    marcasPart = marcasPart.substring(0, endIndex);
    overviewPart = overviewPart + endTag;
  }

  // Write updated Overview
  fs.writeFileSync(overviewFile, overviewPart);

  // Write new MarcasMontadoras
  const marcasCode = `import React from 'react';\n\nexport default function MarcasMontadoras() {\n  return (\n    <main className="flex-1 p-4 md:p-8 space-y-10 w-full">\n      ${marcasPart}\n    </main>\n  );\n}\n`;
  fs.writeFileSync('src/pages/admin/MarcasMontadoras.jsx', marcasCode);

  console.log('Split Marcas successful');
} else {
  console.log('Could not find marcas section in Overview.jsx');
}
