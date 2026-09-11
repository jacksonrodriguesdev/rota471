#!/usr/bin/env bash
# Empacota o projeto local e envia para o VPS via scp (sem precisar de GitHub).
# Rode no Git Bash, a partir da raiz do projeto:
#   bash deploy/enviar-para-vps.sh usuario@IP_DO_VPS
#
# Inclui api/uploads (fotos reais) e api/database/dump_dados.sql (dados do banco).
# NÃO inclui .env (você cria um novo no servidor, com credenciais de produção).
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Uso: bash deploy/enviar-para-vps.sh usuario@IP_DO_VPS"
  exit 1
fi
DESTINO="$1"
PACOTE="mundocar-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "==> Empacotando projeto..."
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='app/dist' \
    --exclude='api/.env' \
    --exclude='app/.env' \
    --exclude='app/.env.production' \
    --exclude='logs' \
    -czf "/tmp/$PACOTE" .

echo "==> Enviando para $DESTINO (pode pedir a senha/chave do VPS)..."
scp "/tmp/$PACOTE" "$DESTINO:~/$PACOTE"
rm "/tmp/$PACOTE"

echo ""
echo "==> Envio concluído. Agora conecte no VPS e extraia:"
echo ""
echo "    ssh $DESTINO"
echo "    sudo mkdir -p /var/www/mundocar && sudo chown \$USER:\$USER /var/www/mundocar"
echo "    tar -xzf ~/$PACOTE -C /var/www/mundocar"
echo "    rm ~/$PACOTE"
echo ""
echo "Depois siga o DEPLOY.md a partir do passo 4 (variáveis de ambiente)."
