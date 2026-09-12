const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const deployDir = path.join(rootDir, 'deploy_hostinger');
const apiDeployDir = path.join(deployDir, 'api');
const appDeployDir = path.join(deployDir, 'app');

console.log('Iniciando preparação para Hostinger...');

// 1. Criar pasta de deploy limpando a antiga se existir
if (fs.existsSync(deployDir)) {
  console.log('Limpando pasta de deploy antiga...');
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);
fs.mkdirSync(appDeployDir);

// 2. Build do App (Frontend)
console.log('Realizando build do Frontend (isso pode levar alguns segundos)...');
execSync('npm install', { cwd: path.join(rootDir, 'app'), stdio: 'inherit' });
execSync('npm run build', { cwd: path.join(rootDir, 'app'), stdio: 'inherit' });

// 3. Copiar dist do app
console.log('Copiando arquivos estáticos do frontend...');
fs.cpSync(path.join(rootDir, 'app', 'dist'), path.join(appDeployDir, 'dist'), { recursive: true });

// 4. Copiar API (ignorando node_modules)
console.log('Copiando arquivos da API...');
fs.cpSync(path.join(rootDir, 'api'), apiDeployDir, {
  recursive: true,
  filter: (src) => {
    // Ignora a pasta node_modules
    if (src.includes('node_modules')) return false;
    return true;
  }
});

// 5. Garantir que a pasta uploads exista (ou copiar as fotos de teste)
const uploadsDir = path.join(apiDeployDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('======================================================');
console.log('Pronto! A pasta "deploy_hostinger" foi gerada.');
console.log('Instruções para a Hostinger:');
console.log('1. Compacte o CONTEÚDO da pasta "deploy_hostinger" em um arquivo .zip');
console.log('2. Faça o upload desse .zip no Gerenciador de Arquivos da Hostinger (na pasta public_html ou onde configurou seu App Node)');
console.log('3. Descompacte o arquivo lá.');
console.log('4. No hPanel da Hostinger, crie/configure o App Node.js apontando o arquivo de início para: api/server.js');
console.log('======================================================');
