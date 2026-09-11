-- ============================================================
-- MundoCar — Schema do banco de dados
-- Gerado a partir do banco `mundocar_db` (Laragon), já criado e testado.
-- Recriar em um servidor novo:
--   mysql -u root -p mundocar_db < api/database/schema.sql
-- ou:  npm run setup   (roda este arquivo + seeds de marcas/usuário admin)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Tabela: veiculos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `veiculos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(150) NOT NULL,
  `versao` VARCHAR(150) DEFAULT NULL,
  `ano_fabricacao` INT NOT NULL,
  `ano_modelo` INT NOT NULL,
  `preco` DECIMAL(10,2) NOT NULL,
  `quilometragem` INT NOT NULL,
  `combustivel` VARCHAR(50) NOT NULL,
  `cambio` VARCHAR(50) NOT NULL,
  `cor` VARCHAR(50) DEFAULT NULL,
  `placa` VARCHAR(10) DEFAULT NULL,
  `descricao` TEXT,
  `unico_dono` TINYINT(1) DEFAULT 0,
  `laudo_aprovado` TINYINT(1) DEFAULT 1,
  -- Especificações técnicas
  `carroceria` VARCHAR(30) DEFAULT NULL,
  `portas` TINYINT DEFAULT NULL,
  `direcao` VARCHAR(30) DEFAULT NULL,
  `ar_condicionado` VARCHAR(40) DEFAULT NULL,
  `tipo_som` VARCHAR(150) DEFAULT NULL,
  `aro_tamanho` VARCHAR(10) DEFAULT NULL,
  `aro_tipo` VARCHAR(40) DEFAULT NULL,
  -- Garantia e documentação
  `garantia_tipo` VARCHAR(60) DEFAULT NULL,
  `garantia_meses` INT DEFAULT NULL,
  `blindado` TINYINT(1) DEFAULT 0,
  `ipva_pago` TINYINT(1) DEFAULT 0,
  `aceita_troca` TINYINT(1) DEFAULT 1,
  `aceita_financiamento` TINYINT(1) DEFAULT 1,
  `revisoes_em_dia` TINYINT(1) DEFAULT 0,
  `manual_chave_reserva` TINYINT(1) DEFAULT 0,
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_veiculos_marca` (`marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: veiculo_imagens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `veiculo_imagens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `veiculo_id` INT NOT NULL,
  `caminho_arquivo` VARCHAR(255) NOT NULL,
  `is_capa` TINYINT(1) DEFAULT 0,
  `ordem` INT DEFAULT 0,
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `veiculo_id` (`veiculo_id`),
  CONSTRAINT `veiculo_imagens_ibfk_1`
    FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: veiculo_opcionais
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `veiculo_opcionais` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `veiculo_id` INT NOT NULL,
  `nome_opcional` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `veiculo_id` (`veiculo_id`),
  CONSTRAINT `veiculo_opcionais_ibfk_1`
    FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: opcionais_catalogo
-- Catálogo de opcionais/equipamentos disponíveis para marcar nos veículos,
-- agrupados por categoria. Gerenciável pelo painel (/dashboard/opcionais).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `opcionais_catalogo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `ordem` INT DEFAULT 0,
  `ativo` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: marcas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `marcas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `origem` VARCHAR(100) NOT NULL,
  `ativa` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: galeria_entregas
-- Fotos da seção "Transparência em Cada Entrega" (Home), curadas pelo painel.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `galeria_entregas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `caminho_arquivo` VARCHAR(255) NOT NULL,
  `titulo` VARCHAR(150) DEFAULT NULL,
  `legenda` VARCHAR(80) DEFAULT NULL,
  `ordem` INT DEFAULT 0,
  `ativa` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_galeria_ordem` (`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: site_config
-- Pares chave/valor para personalização do site (ex.: hero_imagem, logo).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_config` (
  `chave` VARCHAR(50) NOT NULL,
  `valor` TEXT,
  `atualizado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
