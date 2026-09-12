const multer = require('multer');
const path = require('path');
const fs = require('fs');

let UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Fix definitivo para Hostinger Git Deploy e Nginx:
// A Hostinger apaga arquivos não-rastreados na public_html a cada novo deploy.
// Para evitar perder as fotos, vamos salvá-las uma pasta acima da public_html (segura).
if (__dirname.includes('public_html')) {
  const basePath = __dirname.split(/public_html/)[0];
  UPLOAD_DIR = path.join(basePath, 'uploads_persistentes');
} else if (__dirname.includes('hbuilds/source/repository')) {
  const basePath = __dirname.split(/hbuilds\/source\/repository/)[0];
  UPLOAD_DIR = path.join(basePath, 'uploads_persistentes');
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Usa apenas a extensão original; ignora o resto do nome enviado pelo cliente
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, 'veiculo-' + uniqueSuffix + ext);
  },
});

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function fileFilter(req, file, cb) {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagem não suportado. Use JPG, PNG, WEBP ou AVIF.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB por arquivo
    files: 15,
  },
});

module.exports = { upload, UPLOAD_DIR };
