const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'app', 'src', 'pages', 'admin', 'MarcasMontadoras.jsx');

const newContent = `import React, { useState, useEffect } from 'react';

export default function MarcasMontadoras() {
  const [marcas, setMarcas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaMarca, setNovaMarca] = useState({ nome: '', origem: '' });

  const carregarMarcas = () => {
    fetch('http://localhost:3000/api/marcas')
      .then(res => res.json())
      .then(data => setMarcas(data))
      .catch(err => console.error('Erro:', err));
  };

  useEffect(() => {
    carregarMarcas();
  }, []);

  const totalCarros = marcas.reduce((sum, marca) => sum + (marca.carros_vinculados || 0), 0);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!novaMarca.nome || !novaMarca.origem) return;
    
    try {
      const res = await fetch('http://localhost:3000/api/marcas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMarca)
      });
      if (res.ok) {
        setNovaMarca({ nome: '', origem: '' });
        setModalAberto(false);
        carregarMarcas();
      } else {
        alert('Erro ao cadastrar. Talvez a marca já exista.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta marca?')) return;
    try {
      const res = await fetch(\`http://localhost:3000/api/marcas/\${id}\`, { method: 'DELETE' });
      if (res.ok) carregarMarcas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(\`http://localhost:3000/api/marcas/\${id}/status\`, { method: 'PUT' });
      if (res.ok) carregarMarcas();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-10 w-full">
      <section className="space-y-5" id="marcas-montadoras">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">loyalty</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Gerenciador de Marcas & Montadoras</h2>
            </div>
            <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
              Total de <strong>{marcas.length} marcas cadastradas</strong> e <strong>{totalCarros} carros vinculados</strong> no catálogo.
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 hover:border-primary-container text-on-surface hover:text-white transition-all text-label-btn font-label-btn active:scale-95 shadow-lg shadow-black/40 group"
          >
            <span className="material-symbols-outlined text-primary-container group-hover:rotate-90 transition-transform">add_circle</span>
            <span>+ Cadastrar Nova Marca</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {marcas.map(marca => (
            <div key={marca.id} className={\`bg-surface-container-low border \${marca.ativa ? 'border-outline-variant/30 hover:border-primary-container/60' : 'border-error/30 opacity-60'} rounded-xl p-3.5 transition-all hover:-translate-y-0.5 group relative\`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/30 text-on-surface font-headline-sm font-black group-hover:text-primary-container transition-colors uppercase">
                  {marca.nome.substring(0, 2)}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary">
                  {marca.carros_vinculados || 0} carros
                </span>
              </div>
              <div className="font-headline-sm text-on-surface text-[15px] font-bold truncate" title={marca.nome}>
                {marca.nome}
              </div>
              <div className="text-body-sm font-body-sm text-tertiary flex items-center justify-between mt-1">
                <span className="truncate" title={marca.origem}>{marca.origem}</span>
                <span className={\`w-2 h-2 rounded-full \${marca.ativa ? 'bg-emerald-500' : 'bg-error'}\`} title={marca.ativa ? 'Ativo' : 'Inativo'}></span>
              </div>
              
              {/* Action Buttons overlay na miniatura */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleExcluir(marca.id)} className="w-6 h-6 rounded-md bg-error/90 text-white flex items-center justify-center hover:bg-error" title="Excluir">
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
                <button onClick={() => handleToggleStatus(marca.id)} className="w-6 h-6 rounded-md bg-surface-container-high text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-white" title={marca.ativa ? "Desativar" : "Ativar"}>
                  <span className="material-symbols-outlined text-[14px]">{marca.ativa ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Cadastrar Marca */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-title-lg font-title-lg text-white">Cadastrar Nova Marca</h3>
              <button onClick={() => setModalAberto(false)} className="text-tertiary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Nome da Marca</label>
                <input 
                  type="text" 
                  value={novaMarca.nome}
                  onChange={(e) => setNovaMarca({...novaMarca, nome: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  placeholder="Ex: Ferrari, Porsche..." 
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">País de Origem</label>
                <input 
                  type="text" 
                  value={novaMarca.origem}
                  onChange={(e) => setNovaMarca({...novaMarca, origem: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  placeholder="Ex: Itália, Alemanha..." 
                  required
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg text-label-btn font-label-btn text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary-container text-white text-label-btn font-label-btn hover:bg-secondary-container transition-colors shadow-lg">
                  Salvar Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
`;

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log('MarcasMontadoras.jsx refatorado com sucesso!');
