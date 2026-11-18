# Deploy — Hostinger VPS (Ubuntu)

Sem GitHub: o projeto vai do seu PC para o VPS via `scp` (script pronto em
`deploy/enviar-para-vps.sh`). Arquitetura no servidor:

```
Internet → Nginx (:443, SSL)
             ├── /            → app/dist  (build estático do React)
             ├── /api/        → Node/Express :3000  (PM2)
             └── /uploads/    → api/uploads/  (arquivos servidos direto)
                     Node ↔ MySQL (localhost)
```

Front e API no **mesmo domínio** → sem problema de CORS.

---

## 0. O que você precisa ter em mãos

- **IP do VPS** e a senha (ou chave) de root que a Hostinger mandou por e-mail.
- Opcional por enquanto: um domínio apontando pra esse IP (dá pra testar só
  pelo IP antes de configurar DNS).

Teste o acesso SSH primeiro (rode no seu PC, no Git Bash):

```bash
ssh root@IP_DO_VPS
```

Se conectar e cair no terminal do VPS, prossiga. Se pedir "yes/no" pra aceitar
a chave, digite `yes`. Saia com `exit` antes de continuar.

---

## 1. Preparar o servidor (uma vez, dentro do VPS via SSH)

```bash
ssh root@IP_DO_VPS
```

A partir daqui os comandos rodam **dentro do VPS**:

```bash
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

Crie um usuário não-root para a aplicação (recomendado, mas pode pular e usar
root se preferir simplicidade no começo):

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy 2>/dev/null || true
```

Daqui em diante, os comandos assumem que você está como `deploy`
(`su - deploy`) — se preferir continuar como root, tudo funciona igual, só
ignore os `sudo`.

Saia do SSH (`exit`) e volte para o terminal do seu PC para o próximo passo.

---

## 2. Banco de dados (dentro do VPS)

```bash
ssh root@IP_DO_VPS    # ou deploy@IP_DO_VPS
sudo mysql
```
```sql
CREATE DATABASE rota471_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rota471'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON rota471_db.* TO 'rota471'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Guarde a senha que você escolheu — vai usá-la no `.env` no passo 5.

---

## 3. Enviar o projeto do seu PC para o VPS

No seu PC (Git Bash, na raiz do projeto — `C:\Users\USER\Desktop\claude\Mundcar\vers-1`):

```bash
node api/export_dump.js
```

Isso gera `api/database/dump_dados.sql` com os dados reais que você já
cadastrou (veículos, marcas, galeria, etc). Depois:

```bash
bash deploy/enviar-para-vps.sh root@IP_DO_VPS
```

(troque `root` pelo usuário que você vai usar). O script empacota o projeto
— **incluindo** `api/uploads/` (fotos) e o dump do banco, **sem** o `.env` —
e envia via `scp`. Ao final ele imprime os comandos para extrair no servidor;
rode-os (conecta via SSH e roda no VPS):

```bash
ssh root@IP_DO_VPS
sudo mkdir -p /var/www/rota471 && sudo chown $USER:$USER /var/www/rota471
tar -xzf ~/rota471-*.tar.gz -C /var/www/rota471
rm ~/rota471-*.tar.gz
cd /var/www/rota471
```

---

## 4. Configurar variáveis de ambiente (dentro do VPS)

```bash
cp api/.env.production.example api/.env
nano api/.env
```
Preencha:
- `DB_USER=rota471`, `DB_PASSWORD=` (a senha do passo 2), `DB_NAME=rota471_db`
- `JWT_SECRET=` → gere agora mesmo rodando:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CORS_ORIGINS=https://SEU_DOMINIO.com.br,https://www.SEU_DOMINIO.com.br`
  (se ainda não tem domínio, pode deixar `http://IP_DO_VPS` por enquanto)
- `ADMIN_EMAIL` / `ADMIN_SENHA` — só são usados se você optar por recriar o
  admin do zero; como você vai **importar o dump**, o usuário admin já vem
  junto (mesma senha que você usa localmente hoje). Pode deixar como está.

```bash
cp app/.env.production.example app/.env.production
nano app/.env.production      # VITE_API_URL=https://SEU_DOMINIO.com.br (ou http://IP_DO_VPS)
```

---

## 5. Aplicar schema + importar seus dados (dentro do VPS)

```bash
cd api
npm ci
npm run setup:schema
npm run setup:especificacoes
```

Isso cria todas as tabelas vazias. Agora importe os DADOS que vieram no dump:

```bash
mysql -u rota471 -p rota471_db < database/dump_dados.sql
```

(vai pedir a senha do usuário `rota471` do passo 2). Pronto — veículos,
marcas, galeria, catálogo de opcionais e seu usuário admin já estão no ar.

> Não rode `npm run setup:marcas` nem `setup:usuarios` depois de importar o
> dump — eles são só para banco novo/vazio.

---

## 6. Build do frontend e subir a API (dentro do VPS)

```bash
cd ../app
npm ci
npm run build
cd ..

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup              # rode o comando que ele imprimir (com sudo)
pm2 status                # deve mostrar rota471-api "online"
curl http://localhost:3000/     # -> "Rota471 API rodando com sucesso!"
```

---

## 7. Nginx + SSL (dentro do VPS)

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/rota471
sudo nano /etc/nginx/sites-available/rota471     # troque SEU_DOMINIO e o caminho
sudo ln -s /etc/nginx/sites-available/rota471 /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Sem domínio ainda? Edite o `server_name` do arquivo para `_` (catch-all) e
acesse por `http://IP_DO_VPS`. Quando o domínio estiver apontado:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU_DOMINIO.com.br -d www.SEU_DOMINIO.com.br
```

Acesse `https://SEU_DOMINIO.com.br` (ou `http://IP_DO_VPS`) — a vitrine deve
carregar com os mesmos veículos e fotos que você tem localmente.
`/login` — entre com as mesmas credenciais que usa no ambiente local.

---

## 8. Deploys seguintes (quando você mexer no código de novo)

No seu PC:
```bash
bash deploy/enviar-para-vps.sh root@IP_DO_VPS
```
No VPS (depois de extrair o novo pacote em `/var/www/rota471`, sobrescrevendo):
```bash
cd /var/www/rota471
bash deploy/deploy.sh
```
(reinstala dependências, aplica migrações de schema pendentes, rebuilda o
front e reinicia API + Nginx — **não mexe nos dados do banco**.)

Se só mudou conteúdo pelo painel (veículos, galeria, etc.) não precisa fazer
nada — está direto no banco do VPS.

---

## Antes de considerar "no ar de verdade"

- [ ] **Trocar a senha do admin** se ainda estiver usando a de testes.
- [ ] **Logo**: `Home.jsx`, `DetalhesVeiculo.jsx` e `AdminHeader.jsx` usam URLs
      temporárias do Google (`lh3.googleusercontent.com/aida-public/...`) que
      **vão expirar**. Baixe o logo real para `app/public/logo.png` e troque
      as referências.
- [ ] **Backup do banco e dos uploads** no VPS: `mysqldump` diário via cron +
      copiar `api/uploads/` para outro lugar (Hostinger oferece backups do
      VPS inteiro no hPanel — vale ativar).
- [ ] **Páginas de Termos de Uso e Política de Privacidade** (rodapé) — hoje
      são links mortos; a LGPD exige a política, pois o formulário de troca
      coleta nome e telefone.
- [ ] Telefone da loja está fixo no código em ~11 lugares (`5553999262342`).

## Limitações conhecidas (não bloqueiam o deploy, mas planeje)

- Admin não troca a própria senha pela interface (só reimportando o dump).
- Veículo não tem status "vendido/reservado" — sai da vitrine só sendo
  excluído (e a exclusão é permanente, apaga as fotos).
- Sem SSR: links de veículos compartilhados no WhatsApp não mostram preview
  com foto/preço.
- Rate-limit é em memória (ok para 1 instância; zera a cada restart do PM2).
