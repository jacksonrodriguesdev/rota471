const fs = require('fs');

const overviewFile = 'src/pages/admin/Overview.jsx';
let overviewCode = fs.readFileSync(overviewFile, 'utf8');

// Find the section id="cadastro-veiculo"
// Need to find the exact boundaries. We'll use a regex that looks for the section start and its matching close tag.
// Since regex for nested tags is hard, we can just split at '<!-- SECTION 2: NOVO VEÍCULO & CADASTRO COMPLETO DO ESTOQUE -->'
// Wait, looking at the code.html snippet previously:
// <!-- SECTION 2: NOVO VEÍCULO & CADASTRO COMPLETO DO ESTOQUE -->
// <section className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-2xl relative" id="cadastro-veiculo">

const sectionMarker = '<!-- SECTION 2: NOVO VEÍCULO';
// But in Overview.jsx it might have been converted to {/* SECTION 2... */}
const searchStr1 = '{/* SECTION 2:';
const searchStr2 = '<section className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-2xl relative" id="cadastro-veiculo">';

let splitIndex = overviewCode.indexOf(searchStr1);
if (splitIndex === -1) {
  splitIndex = overviewCode.indexOf(searchStr2);
}

if (splitIndex !== -1) {
  let overviewPart = overviewCode.substring(0, splitIndex);
  let cadastroPart = overviewCode.substring(splitIndex);

  // But we need to make sure we don't grab the closing </main> or closing tags of Overview.jsx.
  // Actually, Overview.jsx was wrapped in <> ... </>. So it ends with </>\n  );\n}\n
  const endTag = '</>\n  );\n}';
  const endIndex = cadastroPart.lastIndexOf('</>');
  
  if (endIndex !== -1) {
    cadastroPart = cadastroPart.substring(0, endIndex);
    overviewPart = overviewPart + '\n' + endTag;
  }

  // Write updated Overview
  fs.writeFileSync(overviewFile, overviewPart);

  // Write new CadastroVeiculo
  const cadastroCode = `import React from 'react';\n\nexport default function CadastroVeiculo() {\n  return (\n    <>\n      ${cadastroPart}\n    </>\n  );\n}\n`;
  fs.writeFileSync('src/pages/admin/CadastroVeiculo.jsx', cadastroCode);

  console.log('Split successful');
} else {
  console.log('Could not find cadastro section in Overview.jsx');
}
