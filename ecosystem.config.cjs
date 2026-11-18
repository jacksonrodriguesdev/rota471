// Configuração do PM2 — gerenciador de processo do backend.
// Uso no VPS:
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   (para reiniciar sozinho no boot)
module.exports = {
  apps: [
    {
      name: 'rota471-api',
      cwd: './api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      // dotenv já carrega api/.env; não repita segredos aqui.
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      time: true,
    },
  ],
};
