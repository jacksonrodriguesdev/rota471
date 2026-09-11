const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'server.js');
let content = fs.readFileSync(targetFile, 'utf8');

const injection = `
// Endpoint para Buscar um Único Veículo (para edição)
app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const db = await getPool();
    const [veiculos] = await db.query('SELECT * FROM veiculos WHERE id = ?', [req.params.id]);
    if (veiculos.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    const veiculo = veiculos[0];
    
    const [opcionais] = await db.query('SELECT nome_opcional FROM veiculo_opcionais WHERE veiculo_id = ?', [req.params.id]);
    veiculo.opcionais = opcionais.map(o => o.nome_opcional);
    
    const [imagens] = await db.query('SELECT * FROM veiculo_imagens WHERE veiculo_id = ? ORDER BY ordem', [req.params.id]);
    veiculo.imagens = imagens;
    
    res.json(veiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar veículo' });
  }
});

// Endpoint para Editar Veículo
app.put('/api/veiculos/:id', upload.array('imagens', 10), async (req, res) => {
  try {
    const db = await getPool();
    const id = req.params.id;
    const {
      marca, modelo, versao, placa, ano_fabricacao, ano_modelo,
      quilometragem, cor, cambio, combustivel, preco
    } = req.body;

    let opcionais = [];
    if (req.body.opcionais) {
      try { opcionais = JSON.parse(req.body.opcionais); } catch (e) { opcionais = []; }
    }

    await db.execute(
      \`UPDATE veiculos SET 
        marca=?, modelo=?, versao=?, placa=?, ano_fabricacao=?, ano_modelo=?,
        quilometragem=?, cor=?, cambio=?, combustivel=?, preco=?
      WHERE id=?\`,
      [marca, modelo, versao, placa, ano_fabricacao, ano_modelo, quilometragem, cor, cambio, combustivel, preco, id]
    );

    // Atualizar opcionais (apaga tudo e recria)
    await db.execute('DELETE FROM veiculo_opcionais WHERE veiculo_id = ?', [id]);
    for (const opt of opcionais) {
      await db.execute(
        'INSERT INTO veiculo_opcionais (veiculo_id, nome_opcional) VALUES (?, ?)',
        [id, opt]
      );
    }

    // Se vieram novas imagens, a gente insere (idealmente teria uma lógica de exclusão específica, mas vamos apenas adicionar novas)
    if (req.files && req.files.length > 0) {
      // Pega a ultima ordem
      const [ordens] = await db.query('SELECT MAX(ordem) as m FROM veiculo_imagens WHERE veiculo_id = ?', [id]);
      let ordem = (ordens[0].m || 0) + 1;
      
      for (let i = 0; i < req.files.length; i++) {
        const filePath = '/uploads/' + req.files[i].filename;
        await db.execute(
          'INSERT INTO veiculo_imagens (veiculo_id, caminho_arquivo, is_capa, ordem) VALUES (?, ?, ?, ?)',
          [id, filePath, false, ordem++]
        );
      }
    }

    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar veículo' });
  }
});

// Endpoint para Excluir Veículo
app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    const db = await getPool();
    // Excluir Imagens Físicas (Opcional - por enquanto excluímos os registros no banco via CASCADE ou explicitamente)
    await db.execute('DELETE FROM veiculo_imagens WHERE veiculo_id = ?', [req.params.id]);
    await db.execute('DELETE FROM veiculo_opcionais WHERE veiculo_id = ?', [req.params.id]);
    await db.execute('DELETE FROM veiculos WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Veículo excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir veículo' });
  }
});

`;

content = content.replace('// Endpoint para Listar Marcas', injection + '// Endpoint para Listar Marcas');
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Rotas CRUD de veiculos adicionadas!');
