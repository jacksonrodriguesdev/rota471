const fs = require('fs');
let html = fs.readFileSync('../code.html', 'utf8');

// Extrair o conteúdo do body
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (bodyMatch) {
  let bodyContent = bodyMatch[1];
  
  // Substituições básicas para JSX
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
  bodyContent = bodyContent.replace(/<!--/g, '{/*');
  bodyContent = bodyContent.replace(/-->/g, '*/}');
  // Fechar tags vazias (img, input, hr, br)
  bodyContent = bodyContent.replace(/<(img|input|hr|br)([^>]*[^\/])>/g, '<$1$2 />');
  // Atributos style inline
  // bodyContent = bodyContent.replace(/style="([^"]*)"/g, 'style={{}}'); // Simplificação
  
  const appContent = `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="dark">\n      ${bodyContent}\n    </div>\n  );\n}\n\nexport default App;\n`;
  
  fs.writeFileSync('./src/App.jsx', appContent);
  console.log('App.jsx gerado com sucesso!');
} else {
  console.log('Não foi possível encontrar a tag body');
}
