#!/usr/bin/env bash
# Roda NO VPS depois que os arquivos já estão em /var/www/mundocar
# (via deploy/enviar-para-vps.sh ou um novo envio manual).
# Uso: cd /var/www/mundocar && bash deploy/deploy.sh
set -euo pipefail

echo "==> Backend: dependências"
cd api
npm ci --omit=dev
# Migrações de schema idempotentes (só cria o que falta, nunca apaga dados)
npm run setup:schema
npm run setup:especificacoes
cd ..

echo "==> Frontend: build"
cd app
npm ci
npm run build
cd ..

echo "==> Reiniciando API (PM2)"
pm2 startOrReload ecosystem.config.cjs
pm2 save

echo "==> Recarregando Nginx"
sudo nginx -t && sudo systemctl reload nginx

echo "==> Deploy concluído."
