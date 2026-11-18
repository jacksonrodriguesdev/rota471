-- Inserir ou atualizar administrador Rota471
-- Email: rota471@gmail.com
-- Senha: Rota471@123 (hash bcrypt gerado com salt 10)

INSERT INTO `usuarios` (`nome`, `email`, `senha`, `role`)
VALUES (
  'Administrador Rota471',
  'rota471@gmail.com',
  '$2b$10$kzJX44PGLYA1Q2Mjh.vbv.zyBxRDxspY1M.wCe9d.5WaiAQJzfHji',
  'superadmin'
)
ON DUPLICATE KEY UPDATE
  `senha` = '$2b$10$kzJX44PGLYA1Q2Mjh.vbv.zyBxRDxspY1M.wCe9d.5WaiAQJzfHji',
  `role` = 'superadmin';
