// Migração idempotente: adiciona as colunas novas de especificações técnicas
// e garantia à tabela `veiculos` (se ainda não existirem) e cria + popula o
// catálogo de opcionais. Seguro rodar quantas vezes quiser.
require('dotenv').config();
const mysql = require('mysql2/promise');

const NOVAS_COLUNAS = [
  { nome: 'carroceria', ddl: 'VARCHAR(30) DEFAULT NULL' },
  { nome: 'portas', ddl: 'TINYINT DEFAULT NULL' },
  { nome: 'direcao', ddl: 'VARCHAR(30) DEFAULT NULL' },
  { nome: 'ar_condicionado', ddl: 'VARCHAR(40) DEFAULT NULL' },
  { nome: 'tipo_som', ddl: 'VARCHAR(150) DEFAULT NULL' },
  { nome: 'aro_tamanho', ddl: 'VARCHAR(10) DEFAULT NULL' },
  { nome: 'aro_tipo', ddl: 'VARCHAR(40) DEFAULT NULL' },
  { nome: 'garantia_tipo', ddl: 'VARCHAR(60) DEFAULT NULL' },
  { nome: 'garantia_meses', ddl: 'INT DEFAULT NULL' },
  { nome: 'blindado', ddl: 'TINYINT(1) DEFAULT 0' },
  { nome: 'ipva_pago', ddl: 'TINYINT(1) DEFAULT 0' },
  { nome: 'aceita_troca', ddl: 'TINYINT(1) DEFAULT 1' },
  { nome: 'aceita_financiamento', ddl: 'TINYINT(1) DEFAULT 1' },
  { nome: 'revisoes_em_dia', ddl: 'TINYINT(1) DEFAULT 0' },
  { nome: 'manual_chave_reserva', ddl: 'TINYINT(1) DEFAULT 0' },
];

// [nome, categoria]
const CATALOGO_PADRAO = [
  // Conforto
  ['Ar-condicionado Digital', 'Conforto'],
  ['Bancos em Couro', 'Conforto'],
  ['Bancos com Ajuste Elétrico', 'Conforto'],
  ['Teto Solar Elétrico', 'Conforto'],
  ['Piloto Automático (Cruise Control)', 'Conforto'],
  ['Volante Multifuncional', 'Conforto'],
  ['Chave Presencial / Start-Stop', 'Conforto'],
  ['Ar-condicionado Traseiro (Digital)', 'Conforto'],
  ['Vidros Elétricos', 'Conforto'],
  ['Travas Elétricas', 'Conforto'],
  ['Direção Elétrica', 'Conforto'],
  // Tecnologia & Multimídia
  ['Apple CarPlay & Android Auto', 'Tecnologia & Multimídia'],
  ['Central Multimídia com Tela', 'Tecnologia & Multimídia'],
  ['Carregador por Indução', 'Tecnologia & Multimídia'],
  ['Head-up Display', 'Tecnologia & Multimídia'],
  ['Sensor de Chuva', 'Tecnologia & Multimídia'],
  ['Faróis de LED', 'Tecnologia & Multimídia'],
  ['Piloto Automático Adaptativo', 'Tecnologia & Multimídia'],
  ['Comando de Voz', 'Tecnologia & Multimídia'],
  // Segurança
  ['Câmera de Ré', 'Segurança'],
  ['Sensor de Estacionamento', 'Segurança'],
  ['Múltiplos Airbags', 'Segurança'],
  ['Controle de Estabilidade (ESP)', 'Segurança'],
  ['Alarme Antifurto', 'Segurança'],
  ['Rastreador Veicular', 'Segurança'],
  ['Assistente de Partida em Rampa', 'Segurança'],
  ['Freios ABS', 'Segurança'],
  // Rodas & Estética
  ['Rodas de Liga Leve', 'Rodas & Estética'],
  ['Estribo Lateral', 'Rodas & Estética'],
  ['Engate para Reboque', 'Rodas & Estética'],
  ['Capota Marítima', 'Rodas & Estética'],
  ['Faróis de Milha', 'Rodas & Estética'],
  ['Película nos Vidros', 'Rodas & Estética'],
];

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mundocar_db',
  });

  try {
    console.log('Verificando colunas de especificações em `veiculos`...');
    const [colunasAtuais] = await db.query('SHOW COLUMNS FROM veiculos');
    const nomesAtuais = new Set(colunasAtuais.map((c) => c.Field));

    for (const col of NOVAS_COLUNAS) {
      if (nomesAtuais.has(col.nome)) continue;
      await db.query(`ALTER TABLE veiculos ADD COLUMN \`${col.nome}\` ${col.ddl}`);
      console.log(`  + coluna adicionada: ${col.nome}`);
    }

    console.log('Criando tabela opcionais_catalogo (se não existir)...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS opcionais_catalogo (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        ordem INT DEFAULT 0,
        ativo TINYINT(1) DEFAULT 1,
        PRIMARY KEY (id),
        UNIQUE KEY nome (nome)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Populando catálogo padrão de opcionais...');
    let inseridos = 0;
    for (let i = 0; i < CATALOGO_PADRAO.length; i++) {
      const [nome, categoria] = CATALOGO_PADRAO[i];
      const [result] = await db.query(
        'INSERT IGNORE INTO opcionais_catalogo (nome, categoria, ordem) VALUES (?, ?, ?)',
        [nome, categoria, i]
      );
      if (result.affectedRows > 0) inseridos++;
    }
    console.log(`  ${inseridos} opcionais novos inseridos (os já existentes foram ignorados).`);

    console.log('Migração de especificações concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração de especificações:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

run();
