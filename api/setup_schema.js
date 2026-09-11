require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mundocar_db',
    multipleStatements: true,
  });

  try {
    console.log('Aplicando database/schema.sql...');
    await conn.query(sql);
    console.log('Schema aplicado com sucesso (tabelas criadas se não existiam).');
  } catch (error) {
    console.error('Erro ao aplicar o schema:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

run();
