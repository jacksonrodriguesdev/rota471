require('dotenv').config();

/**
 * Centraliza a leitura das variáveis de ambiente e valida as obrigatórias.
 * Falha rápido na inicialização se algo essencial estiver faltando.
 */

function required(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    console.error(`\n[FATAL] Variável de ambiente obrigatória ausente: ${name}`);
    console.error('Copie api/.env.example para api/.env e preencha os valores.\n');
    process.exit(1);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rota471_db',
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

// Impede uso do segredo de exemplo/fraco em produção
if (env.nodeEnv === 'production' && env.jwt.secret.length < 32) {
  console.error('\n[FATAL] JWT_SECRET muito curto para produção (mínimo 32 caracteres).\n');
  process.exit(1);
}

module.exports = env;
