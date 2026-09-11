const fs = require('fs');
let html = fs.readFileSync('../dashboard/code.html', 'utf8');

// Extrair o conteúdo do body
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (bodyMatch) {
  let bodyContent = bodyMatch[1];
  
  // Substituições básicas para JSX
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
  bodyContent = bodyContent.replace(/<!--/g, '{/*');
  bodyContent = bodyContent.replace(/-->/g, '*/}');
  // Fechar tags
  bodyContent = bodyContent.replace(/<br>/g, '<br />');
  bodyContent = bodyContent.replace(/<hr>/g, '<hr />');
  bodyContent = bodyContent.replace(/<(img|input)([^>]*[^\/])>/g, '<$1$2 />');
  
  // Remover styles inline
  bodyContent = bodyContent.replace(/style="[^"]*"/g, '');
  
  const appContent = `import React from 'react';\n\nfunction Dashboard() {\n  return (\n    <div className="dark bg-surface-container-lowest min-h-screen">\n      ${bodyContent}\n    </div>\n  );\n}\n\nexport default Dashboard;\n`;
  
  fs.writeFileSync('./src/pages/Dashboard.jsx', appContent);
  console.log('Dashboard.jsx gerado com sucesso!');
} else {
  console.log('Não foi possível encontrar a tag body');
}
