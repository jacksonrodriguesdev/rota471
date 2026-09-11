#!/usr/bin/env bash
# Deploy incremental no VPS. Rode de dentro da pasta do projeto: bash deploy/deploy.sh
set -euo pipefail

echo "==> Atualizando código"
git pull --ff-only

echo "==> Backend: dependências"
cd api
npm ci --omit=dev
# Aplica migrações de schema idempotentes (não apaga nada)
npm run setup:schema
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
