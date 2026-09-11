const mysql = require('mysql2/promise');
const env = require('./env');

let pool;

/**
 * Retorna um pool de conexões MySQL reutilizável (singleton).
 */
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

module.exports = { getPool };
