// Exporta os DADOS do banco local (Laragon) para um .sql portátil, sem depender
// do binário mysqldump. Rode local: node export_dump.js
// O arquivo gerado (database/dump_dados.sql) é IMPORTADO no VPS depois do schema.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Ordem importa por causa das foreign keys (pai antes do filho)
const TABELAS = [
  'marcas',
  'usuarios',
  'veiculos',
  'veiculo_imagens',
  'veiculo_opcionais',
  'opcionais_catalogo',
  'galeria_entregas',
  'site_config',
];

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mundocar_db',
  });

  const saida = [
    '-- Dump de DADOS do MundoCar (gerado por export_dump.js)',
    '-- Rode DEPOIS de aplicar o schema (npm run setup:schema) no destino.',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    '',
  ];

  let totalLinhas = 0;

  for (const tabela of TABELAS) {
    const [linhas] = await db.query(`SELECT * FROM \`${tabela}\``);
    if (linhas.length === 0) {
      console.log(`  ${tabela}: 0 linhas (pulando)`);
      continue;
    }

    const colunas = Object.keys(linhas[0]);
    saida.push(`-- ${tabela} (${linhas.length} linhas)`);
    saida.push(`DELETE FROM \`${tabela}\`;`);

    for (const linha of linhas) {
      const valores = colunas.map((c) => db.escape(linha[c]));
      saida.push(
        `INSERT INTO \`${tabela}\` (${colunas.map((c) => `\`${c}\``).join(', ')}) VALUES (${valores.join(', ')});`
      );
    }
    saida.push('');
    totalLinhas += linhas.length;
    console.log(`  ${tabela}: ${linhas.length} linhas`);
  }

  saida.push('SET FOREIGN_KEY_CHECKS = 1;');

  const destDir = path.join(__dirname, 'database');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destino = path.join(destDir, 'dump_dados.sql');
  fs.writeFileSync(destino, saida.join('\n'), 'utf8');

  console.log(`\nDump gerado: ${destino}`);
  console.log(`Total: ${totalLinhas} linhas em ${TABELAS.length} tabelas.`);
  console.log('\nEnvie esse arquivo para o VPS e importe com:');
  console.log('  mysql -u mundocar -p mundocar_db < dump_dados.sql');

  await db.end();
}

run().catch((err) => {
  console.error('Erro ao gerar dump:', err.message);
  process.exit(1);
});
