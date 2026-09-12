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
-- Dump de DADOS do MundoCar (gerado por export_dump.js)
-- Rode DEPOIS de aplicar o schema (npm run setup:schema) no destino.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- marcas (10 linhas)
DELETE FROM `marcas`;
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (1, 'Toyota', 'Japão', 0, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (2, 'Chevrolet', 'EUA', 1, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (3, 'Ford', 'EUA', 1, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (4, 'Peugeot', 'França', 1, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (5, 'Fiat', 'Itália', 0, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (6, 'Jeep', 'EUA', 1, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (7, 'Honda', 'Japão', 0, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (8, 'Volkswagen', 'Alemanha', 0, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (9, 'Hyundai', 'Coreia do Sul', 0, '2026-09-10 00:20:44.000');
INSERT INTO `marcas` (`id`, `nome`, `origem`, `ativa`, `criado_em`) VALUES (10, 'Audi', 'Alemanha', 1, '2026-09-10 00:20:44.000');

-- usuarios (2 linhas)
DELETE FROM `usuarios`;
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `role`, `criado_em`) VALUES (1, 'Administrador Principal', 'admin@gmail.com', '$2b$10$2RITmU04X7W3I8lCkSN9kOnvQ8mUq.jA9nYiYmjZTbAG5WFh8aEva', 'superadmin', '2026-09-10 00:57:27.000');
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `role`, `criado_em`) VALUES (2, 'Taylor', 'taylor@gmail.com', '$2b$10$VU1xARzoMWRUb9PfplnZj.kwkGpfphsm/OWd1KfqN/w8.nep0tNmS', 'admin', '2026-09-10 01:13:09.000');

-- veiculos (3 linhas)
DELETE FROM `veiculos`;
INSERT INTO `veiculos` (`id`, `marca`, `modelo`, `versao`, `ano_fabricacao`, `ano_modelo`, `preco`, `quilometragem`, `combustivel`, `cambio`, `cor`, `placa`, `descricao`, `unico_dono`, `laudo_aprovado`, `criado_em`, `atualizado_em`, `carroceria`, `portas`, `direcao`, `ar_condicionado`, `tipo_som`, `aro_tamanho`, `aro_tipo`, `garantia_tipo`, `garantia_meses`, `blindado`, `ipva_pago`, `aceita_troca`, `aceita_financiamento`, `revisoes_em_dia`, `manual_chave_reserva`) VALUES (1, 'Chevrolet', 'oNIZZZZZZ', '1.2 TURBO FLEX', 2022, 2023, '222900.00', 23311, 'Gasolina', 'Manual', 'prata', 'avsa2342', '', 0, 1, '2026-09-10 00:12:29.000', '2026-09-10 22:34:06.000', 'Hatch', 4, 'Elétrica', 'Digital (Dual Zone)', 'Multimídia 9\" Android Auto/CarPlay', '17', 'Liga Leve Esportiva', 'Garantia Mundo Car', 6, 0, 0, 1, 1, 1, 1);
INSERT INTO `veiculos` (`id`, `marca`, `modelo`, `versao`, `ano_fabricacao`, `ano_modelo`, `preco`, `quilometragem`, `combustivel`, `cambio`, `cor`, `placa`, `descricao`, `unico_dono`, `laudo_aprovado`, `criado_em`, `atualizado_em`, `carroceria`, `portas`, `direcao`, `ar_condicionado`, `tipo_som`, `aro_tamanho`, `aro_tipo`, `garantia_tipo`, `garantia_meses`, `blindado`, `ipva_pago`, `aceita_troca`, `aceita_financiamento`, `revisoes_em_dia`, `manual_chave_reserva`) VALUES (2, 'Ford', 'Fiesta', '2013', 2012, 2014, '11900.00', 279800, 'Gasolina', 'Manual', 'prata', 'avsa2342', '', 0, 1, '2026-09-10 00:23:33.000', '2026-09-10 00:23:33.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 1, 0, 0);
INSERT INTO `veiculos` (`id`, `marca`, `modelo`, `versao`, `ano_fabricacao`, `ano_modelo`, `preco`, `quilometragem`, `combustivel`, `cambio`, `cor`, `placa`, `descricao`, `unico_dono`, `laudo_aprovado`, `criado_em`, `atualizado_em`, `carroceria`, `portas`, `direcao`, `ar_condicionado`, `tipo_som`, `aro_tamanho`, `aro_tipo`, `garantia_tipo`, `garantia_meses`, `blindado`, `ipva_pago`, `aceita_troca`, `aceita_financiamento`, `revisoes_em_dia`, `manual_chave_reserva`) VALUES (3, 'Audi', 'wert', 'ewrt', 2345, 2345, '22222.00', 43434453, 'Flex', 'Automático', '34', 'wert', '', 0, 1, '2026-09-10 22:38:20.000', '2026-09-10 22:38:20.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Garantia de Fábrica', 12, 1, 1, 1, 1, 1, 1);

-- veiculo_imagens (7 linhas)
DELETE FROM `veiculo_imagens`;
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (1, 1, '/uploads/veiculo-1789009949132-967473499.jpeg', 1, 0, '2026-09-10 00:12:29.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (2, 1, '/uploads/veiculo-1789009949139-392842634.jpeg', 0, 1, '2026-09-10 00:12:29.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (3, 2, '/uploads/veiculo-1789010613318-774870849.jpeg', 1, 0, '2026-09-10 00:23:33.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (4, 3, '/uploads/veiculo-1789090700076-583302115.jpeg', 1, 0, '2026-09-10 22:38:20.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (5, 3, '/uploads/veiculo-1789090700081-100099882.jpeg', 0, 1, '2026-09-10 22:38:20.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (6, 3, '/uploads/veiculo-1789090700088-654046913.jpeg', 0, 2, '2026-09-10 22:38:20.000');
INSERT INTO `veiculo_imagens` (`id`, `veiculo_id`, `caminho_arquivo`, `is_capa`, `ordem`, `criado_em`) VALUES (7, 3, '/uploads/veiculo-1789090700092-76047621.jpeg', 0, 3, '2026-09-10 22:38:20.000');

-- veiculo_opcionais (31 linhas)
DELETE FROM `veiculo_opcionais`;
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (8, 2, 'Câmera de Ré');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (25, 1, 'Direção Elétrica');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (26, 1, 'Rodas de Liga Leve');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (27, 1, 'Câmera de Ré');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (28, 1, 'Sensor de Estacionamento');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (29, 1, 'Ar-condicionado Digital');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (30, 1, 'Apple CarPlay & Android Auto');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (31, 1, 'Bancos em Couro');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (32, 1, 'Chave Presencial / Start-Stop');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (33, 3, 'Faróis de Milha');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (34, 3, 'Estribo Lateral');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (35, 3, 'Rodas de Liga Leve');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (36, 3, 'Engate para Reboque');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (37, 3, 'Controle de Estabilidade (ESP)');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (38, 3, 'Múltiplos Airbags');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (39, 3, 'Câmera de Ré');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (40, 3, 'Apple CarPlay & Android Auto');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (41, 3, 'Head-up Display');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (42, 3, 'Carregador por Indução');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (43, 3, 'Central Multimídia com Tela');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (44, 3, 'Rastreador Veicular');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (45, 3, 'Sensor de Estacionamento');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (46, 3, 'Alarme Antifurto');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (47, 3, 'Volante Multifuncional');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (48, 3, 'Bancos em Couro');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (49, 3, 'Ar-condicionado Digital');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (50, 3, 'Piloto Automático (Cruise Control)');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (51, 3, 'Vidros Elétricos');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (52, 3, 'Direção Elétrica');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (53, 3, 'Chave Presencial / Start-Stop');
INSERT INTO `veiculo_opcionais` (`id`, `veiculo_id`, `nome_opcional`) VALUES (54, 3, 'Bancos com Ajuste Elétrico');

-- opcionais_catalogo (33 linhas)
DELETE FROM `opcionais_catalogo`;
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (1, 'Ar-condicionado Digital', 'Conforto', 0, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (2, 'Bancos em Couro', 'Conforto', 1, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (3, 'Bancos com Ajuste Elétrico', 'Conforto', 2, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (4, 'Teto Solar Elétrico', 'Conforto', 3, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (5, 'Piloto Automático (Cruise Control)', 'Conforto', 4, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (6, 'Volante Multifuncional', 'Conforto', 5, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (7, 'Chave Presencial / Start-Stop', 'Conforto', 6, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (8, 'Ar-condicionado Traseiro (Digital)', 'Conforto', 7, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (9, 'Vidros Elétricos', 'Conforto', 8, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (10, 'Travas Elétricas', 'Conforto', 9, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (11, 'Direção Elétrica', 'Conforto', 10, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (12, 'Apple CarPlay & Android Auto', 'Tecnologia & Multimídia', 11, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (13, 'Central Multimídia com Tela', 'Tecnologia & Multimídia', 12, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (14, 'Carregador por Indução', 'Tecnologia & Multimídia', 13, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (15, 'Head-up Display', 'Tecnologia & Multimídia', 14, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (16, 'Sensor de Chuva', 'Tecnologia & Multimídia', 15, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (17, 'Faróis de LED', 'Tecnologia & Multimídia', 16, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (18, 'Piloto Automático Adaptativo', 'Tecnologia & Multimídia', 17, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (19, 'Comando de Voz', 'Tecnologia & Multimídia', 18, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (20, 'Câmera de Ré', 'Segurança', 19, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (21, 'Sensor de Estacionamento', 'Segurança', 20, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (22, 'Múltiplos Airbags', 'Segurança', 21, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (23, 'Controle de Estabilidade (ESP)', 'Segurança', 22, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (24, 'Alarme Antifurto', 'Segurança', 23, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (25, 'Rastreador Veicular', 'Segurança', 24, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (26, 'Assistente de Partida em Rampa', 'Segurança', 25, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (27, 'Freios ABS', 'Segurança', 26, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (28, 'Rodas de Liga Leve', 'Rodas & Estética', 27, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (29, 'Estribo Lateral', 'Rodas & Estética', 28, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (30, 'Engate para Reboque', 'Rodas & Estética', 29, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (31, 'Capota Marítima', 'Rodas & Estética', 30, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (32, 'Faróis de Milha', 'Rodas & Estética', 31, 1);
INSERT INTO `opcionais_catalogo` (`id`, `nome`, `categoria`, `ordem`, `ativo`) VALUES (33, 'Película nos Vidros', 'Rodas & Estética', 32, 1);

-- galeria_entregas (4 linhas)
DELETE FROM `galeria_entregas`;
INSERT INTO `galeria_entregas` (`id`, `caminho_arquivo`, `titulo`, `legenda`, `ordem`, `ativa`, `criado_em`) VALUES (3, '/uploads/veiculo-1789037314468-83500200.jpeg', 'Veículo vendido', 'Mais um cliente feliz!', 1, 1, '2026-09-10 07:48:34.000');
INSERT INTO `galeria_entregas` (`id`, `caminho_arquivo`, `titulo`, `legenda`, `ordem`, `ativa`, `criado_em`) VALUES (4, '/uploads/veiculo-1789037386899-237890921.jpeg', 'Hoje entregamos mais um carro a uma cliente', 'Mias um cliente saiu feliz da loja hoje!', 0, 1, '2026-09-10 07:49:46.000');
INSERT INTO `galeria_entregas` (`id`, `caminho_arquivo`, `titulo`, `legenda`, `ordem`, `ativa`, `criado_em`) VALUES (5, '/uploads/veiculo-1789037442387-651354737.jpeg', 'Carro sendo entregue a uma cliente', 'Corsa sedan 1.0 sendo entregue a uma cliente.', 2, 1, '2026-09-10 07:50:42.000');
INSERT INTO `galeria_entregas` (`id`, `caminho_arquivo`, `titulo`, `legenda`, `ordem`, `ativa`, `criado_em`) VALUES (6, '/uploads/veiculo-1789037494249-393567681.jpeg', 'Mais um veículo sendo entregue', 'Hoje pela manha entregamos mais um carro a um cliente, 100% satisfeito!', 3, 1, '2026-09-10 07:51:34.000');

-- site_config (1 linhas)
DELETE FROM `site_config`;
INSERT INTO `site_config` (`chave`, `valor`, `atualizado_em`) VALUES ('hero_imagem', '/uploads/veiculo-1789089638770-511190464.jfif', '2026-09-10 22:20:38.000');

SET FOREIGN_KEY_CHECKS = 1;
