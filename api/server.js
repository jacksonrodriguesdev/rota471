const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('./config/env');
const { getPool } = require('./config/db');
const { authRequired, roleRequired } = require('./middleware/auth');
const { upload, UPLOAD_DIR } = require('./middleware/upload');


const app = express();
app.disable('x-powered-by');

// Atrás do Nginx (1 proxy). Necessário para o rate-limit e os IPs reais dos clientes.
app.set('trust proxy', 1);

/* ============================================================
 * Segurança de base
 * ========================================================== */

// Headers de segurança. Libera o carregamento das imagens de /uploads por outras origens.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS restrito às origens configuradas em CORS_ORIGINS
app.use(
  cors({
    origin(origin, callback) {
      // Permite ferramentas sem origin (curl, health checks) e as origens da allowlist
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origem não autorizada pelo CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rota para servir imagens de forma persistente e driblar o Nginx da Hostinger
app.get('/api/media', (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).json({ error: 'Arquivo não especificado' });
  
  const filePath = path.join(UPLOAD_DIR, path.basename(file)); // path.basename impede directory traversal
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

/* ============================================================
 * Rate limiting
 * ========================================================== */

// Limite global suave para toda a API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Limite agressivo para o login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

/* ============================================================
 * Helpers
 * ========================================================== */

function apagarArquivoUpload(caminhoArquivo) {
  if (!caminhoArquivo) return;
  const nome = path.basename(caminhoArquivo); // impede path traversal
  const alvo = path.join(UPLOAD_DIR, nome);
  fs.promises.unlink(alvo).catch(() => {
    /* arquivo já removido ou inexistente — ignora */
  });
}

const SENHA_MIN = 8;
function senhaFraca(senha) {
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    return `A senha deve ter no mínimo ${SENHA_MIN} caracteres.`;
  }
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha)) {
    return 'A senha deve conter letras maiúsculas, minúsculas e números.';
  }
  return null;
}

function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Campos de especificação técnica / garantia do veículo (Bloco E e F do cadastro)
const CAMPOS_TEXTO_ESPEC = ['carroceria', 'direcao', 'ar_condicionado', 'tipo_som', 'aro_tamanho', 'aro_tipo', 'garantia_tipo'];
const CAMPOS_BOOL_ESPEC = ['blindado', 'ipva_pago', 'aceita_troca', 'aceita_financiamento', 'revisoes_em_dia', 'manual_chave_reserva'];

function extrairEspecificacoes(body) {
  const out = {};
  for (const campo of CAMPOS_TEXTO_ESPEC) out[campo] = body[campo] || null;
  for (const campo of CAMPOS_BOOL_ESPEC) out[campo] = body[campo] === 'true' || body[campo] === '1' || body[campo] === true ? 1 : 0;
  out.portas = body.portas ? Number(body.portas) : null;
  out.garantia_meses = body.garantia_meses ? Number(body.garantia_meses) : null;
  return out;
}

const ORDEM_COLUNAS_ESPEC = [...CAMPOS_TEXTO_ESPEC, 'portas', 'garantia_meses', ...CAMPOS_BOOL_ESPEC];

/* ============================================================
 * Rotas públicas
 * ========================================================== */

// Listar veículos (vitrine pública)
app.get('/api/veiculos', async (req, res) => {
  try {
    const db = await getPool();
    const [veiculos] = await db.query(`
      SELECT v.*, i.caminho_arquivo AS capa_imagem
      FROM veiculos v
      LEFT JOIN veiculo_imagens i ON v.id = i.veiculo_id AND i.is_capa = 1
      ORDER BY v.id DESC
    `);

    const [opcionais] = await db.query('SELECT veiculo_id, nome_opcional FROM veiculo_opcionais');
    veiculos.forEach((v) => {
      v.opcionais = opcionais.filter((o) => o.veiculo_id === v.id).map((o) => o.nome_opcional);
    });

    res.json(veiculos);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro ao buscar no banco de dados' });
  }
});

// Buscar um único veículo
app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const db = await getPool();
    const [veiculos] = await db.query('SELECT * FROM veiculos WHERE id = ?', [req.params.id]);
    if (veiculos.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    const veiculo = veiculos[0];

    const [opcionais] = await db.query(
      'SELECT nome_opcional FROM veiculo_opcionais WHERE veiculo_id = ?',
      [req.params.id]
    );
    veiculo.opcionais = opcionais.map((o) => o.nome_opcional);

    const [imagens] = await db.query(
      'SELECT * FROM veiculo_imagens WHERE veiculo_id = ? ORDER BY ordem',
      [req.params.id]
    );
    veiculo.imagens = imagens;

    res.json(veiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar veículo' });
  }
});

// Listar marcas (usado pela vitrine e pelo formulário de cadastro)
app.get('/api/marcas', async (req, res) => {
  try {
    const db = await getPool();
    const [marcas] = await db.query(`
      SELECT m.*, COUNT(v.id) AS carros_vinculados
      FROM marcas m
      LEFT JOIN veiculos v ON m.nome = v.marca
      GROUP BY m.id
      ORDER BY m.nome ASC
    `);
    res.json(marcas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar marcas' });
  }
});

// Galeria "Transparência em Cada Entrega" — vitrine pública (só as ativas)
app.get('/api/galeria', async (req, res) => {
  try {
    const db = await getPool();
    const [itens] = await db.query(
      'SELECT id, caminho_arquivo, titulo, legenda, ordem FROM galeria_entregas WHERE ativa = 1 ORDER BY ordem ASC, id DESC'
    );
    res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar galeria' });
  }
});

// Catálogo de opcionais/equipamentos — usado pelo formulário de cadastro
app.get('/api/opcionais', async (req, res) => {
  try {
    const db = await getPool();
    const [itens] = await db.query(
      'SELECT id, nome, categoria FROM opcionais_catalogo WHERE ativo = 1 ORDER BY categoria ASC, ordem ASC, nome ASC'
    );
    res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar opcionais' });
  }
});

/* ============================================================
 * Autenticação
 * ========================================================== */

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!emailValido(email) || typeof senha !== 'string' || senha.length === 0) {
      return res.status(400).json({ error: 'Informe e-mail e senha válidos.' });
    }

    const db = await getPool();
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    // Resposta genérica em qualquer falha (não revela se o e-mail existe)
    const credenciaisInvalidas = () =>
      res.status(401).json({ error: 'E-mail ou senha incorretos' });

    if (usuarios.length === 0) return credenciaisInvalidas();

    const usuario = usuarios[0];
    const confere = await bcrypt.compare(senha, usuario.senha);
    if (!confere) return credenciaisInvalidas();

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({
      message: 'Login bem-sucedido',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Valida o token atual e devolve o usuário (usado pelo front no carregamento)
app.get('/api/auth/me', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const [usuarios] = await db.query(
      'SELECT id, nome, email, role FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (usuarios.length === 0) return res.status(401).json({ error: 'Usuário não existe mais.' });
    res.json({ usuario: usuarios[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

/* ============================================================
 * Veículos — escrita (protegida)
 * ========================================================== */

app.post('/api/veiculos', authRequired, upload.array('imagens', 15), async (req, res) => {
  try {
    const db = await getPool();
    const veiculo = req.body;

    if (!veiculo.marca || !veiculo.modelo || !veiculo.ano_fabricacao || !veiculo.preco) {
      return res.status(400).json({ error: 'Campos obrigatórios: marca, modelo, ano e preço.' });
    }

    const spec = extrairEspecificacoes(veiculo);
    const [result] = await db.execute(
      `INSERT INTO veiculos (marca, modelo, versao, ano_fabricacao, ano_modelo, preco, quilometragem, combustivel, cambio, cor, placa, descricao,
        ${ORDEM_COLUNAS_ESPEC.join(', ')})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${ORDEM_COLUNAS_ESPEC.map(() => '?').join(', ')})`,
      [
        veiculo.marca, veiculo.modelo, veiculo.versao || '', veiculo.ano_fabricacao,
        veiculo.ano_modelo, veiculo.preco, veiculo.quilometragem, veiculo.combustivel,
        veiculo.cambio, veiculo.cor || '', veiculo.placa || '', veiculo.descricao || '',
        ...ORDEM_COLUNAS_ESPEC.map((c) => spec[c]),
      ]
    );
    const veiculoId = result.insertId;

    if (veiculo.opcionais) {
      try {
        const opcionais = JSON.parse(veiculo.opcionais);
        for (const opcional of opcionais) {
          await db.execute(
            'INSERT INTO veiculo_opcionais (veiculo_id, nome_opcional) VALUES (?, ?)',
            [veiculoId, opcional]
          );
        }
      } catch (e) {
        console.error('Erro ao processar opcionais:', e);
      }
    }

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = '/api/uploads/' + req.files[i].filename;
        await db.execute(
          'INSERT INTO veiculo_imagens (veiculo_id, caminho_arquivo, is_capa, ordem) VALUES (?, ?, ?, ?)',
          [veiculoId, filePath, i === 0 ? 1 : 0, i]
        );
      }
    }

    res.status(201).json({ message: 'Veículo e imagens cadastrados com sucesso!', id: veiculoId });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno ao salvar no banco de dados' });
  }
});

app.put('/api/veiculos/:id', authRequired, upload.array('imagens', 15), async (req, res) => {
  try {
    const db = await getPool();
    const id = req.params.id;
    const {
      marca, modelo, versao, placa, ano_fabricacao, ano_modelo,
      quilometragem, cor, cambio, combustivel, preco,
    } = req.body;

    let opcionais = [];
    if (req.body.opcionais) {
      try { opcionais = JSON.parse(req.body.opcionais); } catch (e) { opcionais = []; }
    }

    const spec = extrairEspecificacoes(req.body);
    await db.execute(
      `UPDATE veiculos SET
        marca=?, modelo=?, versao=?, placa=?, ano_fabricacao=?, ano_modelo=?,
        quilometragem=?, cor=?, cambio=?, combustivel=?, preco=?,
        ${ORDEM_COLUNAS_ESPEC.map((c) => `${c}=?`).join(', ')}
      WHERE id=?`,
      [
        marca, modelo, versao, placa, ano_fabricacao, ano_modelo, quilometragem, cor, cambio, combustivel, preco,
        ...ORDEM_COLUNAS_ESPEC.map((c) => spec[c]),
        id,
      ]
    );

    await db.execute('DELETE FROM veiculo_opcionais WHERE veiculo_id = ?', [id]);
    for (const opt of opcionais) {
      await db.execute(
        'INSERT INTO veiculo_opcionais (veiculo_id, nome_opcional) VALUES (?, ?)',
        [id, opt]
      );
    }

    let keptImages = [];
    if (req.body.keptImages) {
      try { keptImages = JSON.parse(req.body.keptImages); } catch (e) { keptImages = []; }
    }

    const capaExistingId = req.body.capaExistingId;
    const capaNewIndex = req.body.capaNewIndex;

    // Descobre quais imagens serão removidas para apagar os arquivos físicos
    let imagensParaRemover;
    if (keptImages.length > 0) {
      const placeholders = keptImages.map(() => '?').join(',');
      [imagensParaRemover] = await db.query(
        `SELECT caminho_arquivo FROM veiculo_imagens WHERE veiculo_id = ? AND id NOT IN (${placeholders})`,
        [id, ...keptImages]
      );
      await db.execute(
        `DELETE FROM veiculo_imagens WHERE veiculo_id = ? AND id NOT IN (${placeholders})`,
        [id, ...keptImages]
      );
    } else {
      [imagensParaRemover] = await db.query(
        'SELECT caminho_arquivo FROM veiculo_imagens WHERE veiculo_id = ?',
        [id]
      );
      await db.execute('DELETE FROM veiculo_imagens WHERE veiculo_id = ?', [id]);
    }
    imagensParaRemover.forEach((img) => apagarArquivoUpload(img.caminho_arquivo));

    await db.execute('UPDATE veiculo_imagens SET is_capa = 0 WHERE veiculo_id = ?', [id]);

    if (capaExistingId) {
      await db.execute('UPDATE veiculo_imagens SET is_capa = 1 WHERE id = ? AND veiculo_id = ?', [capaExistingId, id]);
    }

    if (req.files && req.files.length > 0) {
      const [ordens] = await db.query('SELECT MAX(ordem) as m FROM veiculo_imagens WHERE veiculo_id = ?', [id]);
      let ordem = (ordens[0].m || 0) + 1;

      for (let i = 0; i < req.files.length; i++) {
        const filePath = '/api/uploads/' + req.files[i].filename;
        const isCapa = String(capaNewIndex) === String(i) ? 1 : 0;
        await db.execute(
          'INSERT INTO veiculo_imagens (veiculo_id, caminho_arquivo, is_capa, ordem) VALUES (?, ?, ?, ?)',
          [id, filePath, isCapa, ordem++]
        );
      }
    }

    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar veículo' });
  }
});

app.delete('/api/veiculos/:id', authRequired, async (req, res) => {
  try {
    const db = await getPool();

    const [imagens] = await db.query(
      'SELECT caminho_arquivo FROM veiculo_imagens WHERE veiculo_id = ?',
      [req.params.id]
    );

    await db.execute('DELETE FROM veiculo_imagens WHERE veiculo_id = ?', [req.params.id]);
    await db.execute('DELETE FROM veiculo_opcionais WHERE veiculo_id = ?', [req.params.id]);
    await db.execute('DELETE FROM veiculos WHERE id = ?', [req.params.id]);

    imagens.forEach((img) => apagarArquivoUpload(img.caminho_arquivo));

    res.json({ message: 'Veículo excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir veículo' });
  }
});

/* ============================================================
 * Marcas — escrita (protegida)
 * ========================================================== */

app.post('/api/marcas', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const { nome, origem } = req.body || {};
    if (!nome || !origem) {
      return res.status(400).json({ error: 'Informe nome e origem da marca.' });
    }
    const [result] = await db.execute('INSERT INTO marcas (nome, origem) VALUES (?, ?)', [nome, origem]);
    res.status(201).json({ id: result.insertId, message: 'Marca cadastrada!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar marca. Talvez já exista.' });
  }
});

app.delete('/api/marcas/:id', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    await db.execute('DELETE FROM marcas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marca excluída com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir marca' });
  }
});

app.put('/api/marcas/:id/status', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    await db.execute('UPDATE marcas SET ativa = NOT ativa WHERE id = ?', [req.params.id]);
    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

/* ============================================================
 * Catálogo de Opcionais — administração (protegida)
 * ========================================================== */

// Lista completa (inclui inativos) — para o painel
app.get('/api/opcionais/todas', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const [itens] = await db.query(
      'SELECT * FROM opcionais_catalogo ORDER BY categoria ASC, ordem ASC, nome ASC'
    );
    res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar opcionais' });
  }
});

app.post('/api/opcionais', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const { nome, categoria } = req.body || {};
    if (!nome || !categoria) {
      return res.status(400).json({ error: 'Informe nome e categoria do opcional.' });
    }
    const [result] = await db.execute(
      'INSERT INTO opcionais_catalogo (nome, categoria) VALUES (?, ?)',
      [nome, categoria]
    );
    res.status(201).json({ id: result.insertId, message: 'Opcional cadastrado!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar opcional. Talvez já exista.' });
  }
});

app.put('/api/opcionais/:id/status', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    await db.execute('UPDATE opcionais_catalogo SET ativo = NOT ativo WHERE id = ?', [req.params.id]);
    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

app.delete('/api/opcionais/:id', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    await db.execute('DELETE FROM opcionais_catalogo WHERE id = ?', [req.params.id]);
    res.json({ message: 'Opcional excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir opcional' });
  }
});

/* ============================================================
 * Galeria de Entregas — administração (protegida)
 * ========================================================== */

// Lista completa (inclui itens inativos) — para o painel
app.get('/api/galeria/todas', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const [itens] = await db.query(
      'SELECT * FROM galeria_entregas ORDER BY ordem ASC, id DESC'
    );
    res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar galeria' });
  }
});

// Adicionar foto
app.post('/api/galeria', authRequired, upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Selecione uma imagem.' });
    const db = await getPool();
    const { titulo, legenda } = req.body || {};
    const filePath = '/uploads/' + req.file.filename;

    const [ordens] = await db.query('SELECT COALESCE(MAX(ordem), 0) + 1 AS prox FROM galeria_entregas');
    const ordem = ordens[0].prox;

    const [result] = await db.execute(
      'INSERT INTO galeria_entregas (caminho_arquivo, titulo, legenda, ordem) VALUES (?, ?, ?, ?)',
      [filePath, (titulo || '').slice(0, 150), (legenda || '').slice(0, 80), ordem]
    );
    res.status(201).json({ id: result.insertId, message: 'Foto adicionada à galeria!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar foto' });
  }
});

// Reordenar (recebe a lista de ids na ordem desejada) — antes de :id
app.put('/api/galeria/reordenar', authRequired, async (req, res) => {
  try {
    const { ordem } = req.body || {};
    if (!Array.isArray(ordem)) return res.status(400).json({ error: 'Formato inválido.' });
    const db = await getPool();
    for (let i = 0; i < ordem.length; i++) {
      await db.execute('UPDATE galeria_entregas SET ordem = ? WHERE id = ?', [i, ordem[i]]);
    }
    res.json({ message: 'Ordem atualizada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao reordenar' });
  }
});

// Editar textos / visibilidade
app.put('/api/galeria/:id', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const { titulo, legenda, ativa } = req.body || {};
    await db.execute(
      'UPDATE galeria_entregas SET titulo = ?, legenda = ?, ativa = ? WHERE id = ?',
      [(titulo || '').slice(0, 150), (legenda || '').slice(0, 80), ativa ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Item atualizado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Excluir foto (remove o arquivo físico também)
app.delete('/api/galeria/:id', authRequired, async (req, res) => {
  try {
    const db = await getPool();
    const [itens] = await db.query('SELECT caminho_arquivo FROM galeria_entregas WHERE id = ?', [req.params.id]);
    if (itens.length === 0) return res.status(404).json({ error: 'Item não encontrado.' });

    await db.execute('DELETE FROM galeria_entregas WHERE id = ?', [req.params.id]);
    apagarArquivoUpload(itens[0].caminho_arquivo);
    res.json({ message: 'Foto removida da galeria.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir foto' });
  }
});

/* ============================================================
 * Configuração do site (chave/valor)
 * ========================================================== */

// Chaves de imagem que o painel pode alterar
const CONFIG_IMAGENS = ['hero_imagem', 'logo'];

// Config pública (usada pela Home)
app.get('/api/config', async (req, res) => {
  try {
    const db = await getPool();
    const [linhas] = await db.query('SELECT chave, valor FROM site_config');
    const config = {};
    linhas.forEach((l) => { config[l.chave] = l.valor; });
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Definir/trocar uma imagem de configuração (hero_imagem, logo)
app.post('/api/config/imagem/:chave', authRequired, upload.single('imagem'), async (req, res) => {
  try {
    const { chave } = req.params;
    if (!CONFIG_IMAGENS.includes(chave)) {
      return res.status(400).json({ error: 'Chave de configuração inválida.' });
    }
    if (!req.file) return res.status(400).json({ error: 'Selecione uma imagem.' });

    const db = await getPool();
    const novoCaminho = '/uploads/' + req.file.filename;

    const [atual] = await db.query('SELECT valor FROM site_config WHERE chave = ?', [chave]);
    const anterior = atual[0]?.valor;

    await db.execute(
      'INSERT INTO site_config (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
      [chave, novoCaminho]
    );

    if (anterior && anterior !== novoCaminho) apagarArquivoUpload(anterior);

    res.json({ message: 'Imagem atualizada.', valor: novoCaminho });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar imagem' });
  }
});

// Voltar uma imagem de configuração ao padrão (remove do banco e do disco)
app.delete('/api/config/imagem/:chave', authRequired, async (req, res) => {
  try {
    const { chave } = req.params;
    if (!CONFIG_IMAGENS.includes(chave)) {
      return res.status(400).json({ error: 'Chave de configuração inválida.' });
    }
    const db = await getPool();
    const [atual] = await db.query('SELECT valor FROM site_config WHERE chave = ?', [chave]);
    await db.execute('DELETE FROM site_config WHERE chave = ?', [chave]);
    if (atual[0]?.valor) apagarArquivoUpload(atual[0].valor);
    res.json({ message: 'Imagem restaurada para o padrão.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao restaurar imagem' });
  }
});

/* ============================================================
 * Usuários — somente superadmin
 * ========================================================== */

app.get('/api/usuarios', authRequired, roleRequired('superadmin', 'admin'), async (req, res) => {
  try {
    const db = await getPool();
    const [usuarios] = await db.query(
      'SELECT id, nome, email, role, criado_em FROM usuarios ORDER BY id ASC'
    );
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/usuarios', authRequired, roleRequired('superadmin'), async (req, res) => {
  try {
    const db = await getPool();
    const { nome, email, senha, role } = req.body || {};

    if (!nome || !emailValido(email)) {
      return res.status(400).json({ error: 'Informe nome e e-mail válidos.' });
    }
    const erroSenha = senhaFraca(senha);
    if (erroSenha) return res.status(400).json({ error: erroSenha });

    const roleFinal = role === 'superadmin' ? 'superadmin' : 'admin';

    const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

    const hashSenha = await bcrypt.hash(senha, 10);
    await db.execute(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
      [nome, email, hashSenha, roleFinal]
    );

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.delete('/api/usuarios/:id', authRequired, roleRequired('superadmin'), async (req, res) => {
  try {
    const db = await getPool();
    const [usuario] = await db.query('SELECT email FROM usuarios WHERE id = ?', [req.params.id]);

    if (usuario.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (Number(req.params.id) === Number(req.usuario.id)) {
      return res.status(400).json({ error: 'Você não pode excluir a própria conta.' });
    }
    if (usuario[0].email === 'admin@gmail.com') {
      return res.status(403).json({ error: 'O administrador principal não pode ser excluído.' });
    }

    await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

/* ============================================================
 * Servir Frontend (Hostinger Node)
 * ========================================================== */

// Serve os arquivos estáticos do React/Vite
app.use(express.static(path.join(__dirname, '../app/dist')));

// Qualquer rota que não seja /api/... enviamos o index.html (SPA fallback)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../app/dist/index.html'));
});

/* ============================================================
 * Tratamento de erros
 * ========================================================== */

// Erros do Multer e do fileFilter
app.use((err, req, res, next) => {
  if (err && (err.name === 'MulterError' || /Formato de imagem/.test(err.message || ''))) {
    return res.status(400).json({ error: err.message });
  }
  if (err && /CORS/.test(err.message || '')) {
    return res.status(403).json({ error: 'Origem não autorizada.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(env.port, () => {
  console.log(`Servidor Backend rodando na porta ${env.port} [${env.nodeEnv}]`);
  console.log(`CORS liberado para: ${env.corsOrigins.join(', ')}`);
});
