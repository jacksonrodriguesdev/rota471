require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setup() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mundocar_db',
  });

  console.log('Conectado ao banco de dados...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabela "usuarios" criada ou já existente.');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminNome = process.env.ADMIN_NOME || 'Administrador Principal';
  const adminSenha = process.env.ADMIN_SENHA || 'Admin@123';

  const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ?', [adminEmail]);
  if (rows.length === 0) {
    const hashSenha = await bcrypt.hash(adminSenha, 10);
    await db.execute(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
      [adminNome, adminEmail, hashSenha, 'superadmin']
    );
    console.log(`Usuário admin (${adminEmail}) criado com sucesso!`);
    console.log('>> Faça login e troque a senha definida em ADMIN_SENHA assim que possível.');
  } else {
    console.log('Usuário admin já existe. Nenhuma ação necessária.');
  }

  await db.end();
  console.log('Finalizado!');
}

setup().catch(console.error);
