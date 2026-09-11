import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function OpcionaisEquipamentos() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', categoria: '' });

  const carregar = () => {
    api.get('/api/opcionais/todas')
      .then(data => { setItens(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { carregar(); }, []);

  const categoriasExistentes = [...new Set(itens.map(i => i.categoria))].sort();

  const porCategoria = itens.reduce((acc, op) => {
    (acc[op.categoria] = acc[op.categoria] || []).push(op);
    return acc;
  }, {});

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!novo.nome || !novo.categoria) return;
    try {
      await api.post('/api/opcionais', novo);
      setNovo({ nome: '', categoria: '' });
      setModalAberto(false);
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar. Talvez já exista.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/api/opcionais/${id}/status`);
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status.');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este opcional do catálogo? Veículos que já usam esse item não serão afetados.')) return;
    try {
      await api.del(`/api/opcionais/${id}`);
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  if (loading) return <div className="p-8 text-on-surface">Carregando catálogo...</div>;

  const ativos = itens.filter(i => i.ativo).length;

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 w-full">
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">tune</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Opcionais & Equipamentos</h2>
            </div>
            <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
              Catálogo usado no cadastro de veículos (Bloco D). <strong>{ativos}</strong> ativo{ativos !== 1 ? 's' : ''} de {itens.length}.
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white transition-all text-label-btn font-label-btn active:scale-95 shadow-lg shadow-black/40"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>+ Novo Opcional</span>
          </button>
        </div>

        {itens.length === 0 ? (
          <div className="text-tertiary text-body-md py-8 text-center border border-dashed border-outline-variant/30 rounded-2xl">
            Nenhum opcional cadastrado ainda.
          </div>
        ) : (
          Object.entries(porCategoria).map(([categoria, lista]) => (
            <div key={categoria} className="space-y-2.5">
              <span className="text-label-badge font-label-badge text-tertiary uppercase tracking-wider">{categoria}</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {lista.map(op => (
                  <div key={op.id} className={`group relative bg-surface-container-low border rounded-xl p-3 flex items-center justify-between gap-2 transition-colors ${op.ativo ? 'border-outline-variant/30' : 'border-error/30 opacity-60'}`}>
                    <span className="text-body-sm text-on-surface truncate" title={op.nome}>{op.nome}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => handleToggleStatus(op.id)} className="w-6 h-6 rounded-md bg-surface-container-high text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-white" title={op.ativo ? 'Ocultar' : 'Ativar'}>
                        <span className="material-symbols-outlined text-[14px]">{op.ativo ? 'visibility_off' : 'visibility'}</span>
                      </button>
                      <button onClick={() => handleExcluir(op.id)} className="w-6 h-6 rounded-md bg-error/90 text-white flex items-center justify-center hover:bg-error" title="Excluir">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal Novo Opcional */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-title-lg font-title-lg text-white">Novo Opcional</h3>
              <button onClick={() => setModalAberto(false)} className="text-tertiary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Nome do Opcional</label>
                <input
                  type="text"
                  value={novo.nome}
                  onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  placeholder="Ex: Sensor de Ponto Cego"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Categoria</label>
                <input
                  type="text"
                  list="categorias-existentes"
                  value={novo.categoria}
                  onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  placeholder="Ex: Segurança"
                  required
                />
                <datalist id="categorias-existentes">
                  {categoriasExistentes.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg text-label-btn font-label-btn text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary-container text-white text-label-btn font-label-btn hover:bg-secondary-container transition-colors shadow-lg">
                  Salvar Opcional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
