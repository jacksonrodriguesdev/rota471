const multer = require('multer');
const path = require('path');
const fs = require('fs');

let UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const os = require('os');

// Fix definitivo para Hostinger Git Deploy:
// Em servidores Linux (Hostinger), o Git Sync apaga pastas não rastreadas dentro do projeto.
// Portanto, salvamos as imagens direto na raiz do usuário (/home/usuario/mundocar_uploads),
// bem longe da pasta do projeto e imune às atualizações do GitHub.
// No Windows (seu computador local), mantemos dentro de api/uploads para facilitar.
if (os.platform() === 'linux') {
  UPLOAD_DIR = path.join(os.homedir(), 'mundocar_uploads_persistentes');
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
