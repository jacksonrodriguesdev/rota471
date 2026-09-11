# Deploy — Hostinger VPS (Ubuntu)

Arquitetura no servidor:

```
Internet → Nginx (:443, SSL)
             ├── /            → app/dist  (build estático do React)
             ├── /api/        → Node/Express :3000  (PM2)
             └── /uploads/    → api/uploads/  (arquivos servidos direto)
                     Node ↔ MySQL (localhost)
```

Front e API no **mesmo domínio** → sem problema de CORS.

---

## 0. Pré-requisitos

- VPS Hostinger com Ubuntu 22.04/24.04 (painel hPanel → VPS → sistema operacional).
- Um domínio apontando para o IP do VPS (registro **A** para `@` e `www` no DNS).
- Acesso SSH ao VPS (`ssh root@IP_DO_VPS`).
- Repositório Git do projeto acessível (GitHub/GitLab). **Faça `git init` e suba o projeto primeiro** — o deploy é via `git pull`.

---

## 1. Preparar o servidor (uma vez)

```bash
# como root
apt update && apt upgrade -y
apt install -y nginx git ufw

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# MySQL
apt install -y mysql-server
mysql_secure_installation      # defina senha do root, remova acessos anônimos

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

Crie um usuário não-root para a aplicação (recomendado):

```bash
adduser deploy
usermod -aG sudo deploy
# opcional: copie sua chave SSH para o novo usuário
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Daqui em diante, trabalhe como `deploy` (`su - deploy`).

---

## 2. Banco de dados

```bash
sudo mysql
```
```sql
CREATE DATABASE mundocar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mundocar'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON mundocar_db.* TO 'mundocar'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Se você já tem os dados no Laragon, exporte lá com
> `mysqldump -u root mundocar_db > dump.sql`, envie o arquivo pro VPS
> (`scp dump.sql deploy@IP:~/`) e importe:
> `mysql -u mundocar -p mundocar_db < dump.sql`.
> Caso contrário, o `npm run setup` (passo 4) cria o schema a partir de
> `api/database/schema.sql`.

---

## 3. Clonar o projeto

```bash
sudo mkdir -p /var/www/mundocar && sudo chown deploy:deploy /var/www/mundocar
git clone SEU_REPOSITORIO.git /var/www/mundocar
cd /var/www/mundocar
```

---

## 4. Configurar variáveis de ambiente

**Backend** — `api/.env`:

```bash
cp api/.env.production.example api/.env
nano api/.env
```
Preencha:
- `DB_USER=mundocar`, `DB_PASSWORD=` (a senha do passo 2), `DB_NAME=mundocar_db`
- `JWT_SECRET=` → gere: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CORS_ORIGINS=https://SEU_DOMINIO.com.br,https://www.SEU_DOMINIO.com.br`
- `ADMIN_EMAIL` / `ADMIN_SENHA` → suas credenciais iniciais de admin

**Frontend** — `app/.env.production`:

```bash
cp app/.env.production.example app/.env.production
nano app/.env.production      # VITE_API_URL=https://SEU_DOMINIO.com.br
```

---

## 5. Instalar, migrar e buildar

```bash
# Backend
cd api
npm ci --omit=dev
npm run setup            # cria schema + marcas + usuário admin
cd ..

# Frontend
cd app
npm ci
npm run build            # gera app/dist
cd ..
```

---

## 6. Subir a API com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup              # rode o comando que ele imprimir (com sudo)
pm2 status               # deve mostrar mundocar-api "online"
curl http://localhost:3000/     # -> "MundoCar API rodando com sucesso!"
```

---

## 7. Nginx + SSL

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/mundocar
sudo nano /etc/nginx/sites-available/mundocar     # troque SEU_DOMINIO e o caminho
sudo ln -s /etc/nginx/sites-available/mundocar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# SSL grátis (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU_DOMINIO.com.br -d www.SEU_DOMINIO.com.br
```

Acesse `https://SEU_DOMINIO.com.br` — vitrine deve carregar.
`https://SEU_DOMINIO.com.br/login` — entre com `ADMIN_EMAIL` / `ADMIN_SENHA`.

---

## 8. Deploys seguintes

```bash
cd /var/www/mundocar
bash deploy/deploy.sh
```
(faz `git pull`, reinstala, aplica migrações de schema, rebuilda o front e recarrega API + Nginx.)

---

## Antes de considerar "no ar de verdade"

- [ ] **Trocar a senha do admin** após o primeiro login (hoje só via `ADMIN_SENHA` + re-seed — ver limitação abaixo).
- [ ] **Logo**: `Home.jsx`, `DetalhesVeiculo.jsx` e `AdminHeader.jsx` usam URLs temporárias do Google (`lh3.googleusercontent.com/aida-public/...`) para o logotipo, que **vão expirar**. Baixe o logo real para `app/public/logo.png` e troque as referências. (A galeria de entregas e a imagem de fundo do Hero já são gerenciadas pelo painel — `/dashboard/galeria` e `/dashboard/aparencia`.)
- [ ] **Backup do banco e dos uploads**: `mysqldump` diário via cron + copiar `api/uploads/`.
      A pasta `api/uploads/` sobrevive aos deploys, mas não é versionada — se o VPS for recriado, some.
- [ ] **Páginas de Termos de Uso e Política de Privacidade** (rodapé) — hoje são links mortos; a LGPD exige a política, pois o formulário de troca coleta nome e telefone.
- [ ] Telefone da loja está fixo no código em ~11 lugares (`5553999262342`).

## Limitações conhecidas (não bloqueiam o deploy, mas planeje)

- Admin não troca a própria senha pela interface (só re-seed).
- Veículo não tem status "vendido/reservado" — sai da vitrine só sendo excluído (e a exclusão é permanente, apaga as fotos).
- Formulário de cadastro não tem campo "descrição/observações" (a coluna existe no banco e aparece na página de detalhes).
- Sem SSR: links de veículos compartilhados no WhatsApp não mostram preview com foto/preço.
- Rate-limit é em memória (ok para 1 instância; zera a cada restart).
