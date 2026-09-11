const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mundocar_db'
  });

  try {
    console.log('Criando tabela marcas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS marcas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        origem VARCHAR(100) NOT NULL,
        ativa BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir marcas padrão ignorando duplicatas (INSERT IGNORE)
    const marcasPadrao = [
      ['Toyota', 'Japão'],
      ['Chevrolet', 'EUA'],
      ['Ford', 'EUA'],
      ['Peugeot', 'França'],
      ['Fiat', 'Itália'],
      ['Jeep', 'EUA'],
      ['Honda', 'Japão'],
      ['Volkswagen', 'Alemanha'],
      ['Hyundai', 'Coreia do Sul'],
      ['Audi', 'Alemanha']
    ];

    console.log('Populando tabela marcas...');
    for (const [nome, origem] of marcasPadrao) {
      await connection.execute(
        'INSERT IGNORE INTO marcas (nome, origem) VALUES (?, ?)',
        [nome, origem]
      );
    }
    
    console.log('Tabela marcas criada e populada com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  } finally {
    await connection.end();
  }
}

run();
