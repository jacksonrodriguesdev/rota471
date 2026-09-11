const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Extrai o token do header "Authorization: Bearer <token>".
 */
function extrairToken(req) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo === 'Bearer' && token) return token;
  return null;
}

/**
 * Middleware: exige um JWT válido. Popula req.usuario com o payload.
 */
function authRequired(req, res, next) {
  const token = extrairToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.usuario = payload; // { id, email, role }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

/**
 * Middleware factory: exige que o usuário autenticado tenha um dos papéis informados.
 * Deve ser usado SEMPRE depois de authRequired.
 */
function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ error: 'Você não tem permissão para esta ação.' });
    }
    return next();
  };
}

module.exports = { authRequired, roleRequired };
