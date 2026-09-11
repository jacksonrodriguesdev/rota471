import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { mediaUrl } from '../../config';

export default function GaleriaEntregas() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);
  const [form, setForm] = useState({ titulo: '', legenda: '' });
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    api.get('/api/galeria/todas')
      .then(data => { setItens(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { carregar(); }, []);

  const handleArquivo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f);
    setPreview(URL.createObjectURL(f));
  };

  const adicionar = async (e) => {
    e.preventDefault();
    if (!arquivo) return alert('Selecione uma imagem.');
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('imagem', arquivo);
      fd.append('titulo', form.titulo);
      fd.append('legenda', form.legenda);
      await api.upload('/api/galeria', fd);
      setForm({ titulo: '', legenda: '' });
      setArquivo(null);
      setPreview('');
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao adicionar foto.');
    } finally {
      setEnviando(false);
    }
  };

  const salvarItem = async (item) => {
    try {
      await api.put(`/api/galeria/${item.id}`, {
        titulo: item.titulo,
        legenda: item.legenda,
        ativa: item.ativa,
      });
    } catch (err) {
      alert(err.message || 'Erro ao salvar.');
      carregar();
    }
  };

  const atualizarCampo = (id, campo, valor) => {
    setItens(prev => prev.map(it => (it.id === id ? { ...it, [campo]: valor } : it)));
  };

  const toggleAtiva = (item) => {
    const novo = { ...item, ativa: item.ativa ? 0 : 1 };
    setItens(prev => prev.map(it => (it.id === item.id ? novo : it)));
    salvarItem(novo);
  };

  const excluir = async (id) => {
    if (!window.confirm('Remover esta foto da galeria?')) return;
    try {
      await api.del(`/api/galeria/${id}`);
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  const mover = async (index, dir) => {
    const alvo = index + dir;
    if (alvo < 0 || alvo >= itens.length) return;
    const nova = [...itens];
    [nova[index], nova[alvo]] = [nova[alvo], nova[index]];
    setItens(nova);
    setSalvandoOrdem(true);
    try {
      await api.put('/api/galeria/reordenar', { ordem: nova.map(i => i.id) });
    } catch (err) {
      alert(err.message || 'Erro ao reordenar.');
      carregar();
    } finally {
      setSalvandoOrdem(false);
    }
  };

  if (loading) return <div className="p-8 text-on-surface">Carregando galeria...</div>;

  const ativas = itens.filter(i => i.ativa).length;

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 w-full">
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">photo_library</span>
            <h2 className="text-headline-md font-headline-md text-on-surface">Galeria de Entregas</h2>
          </div>
          <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
            Slider da seção <strong>“Transparência em Cada Entrega”</strong> na página inicial.
            {' '}<strong>{ativas}</strong> ativa{ativas !== 1 ? 's' : ''} de {itens.length}. A ordem abaixo é a ordem do slider.
          </p>
        </div>

        {/* Formulário de adição */}
        <form onSubmit={adicionar} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 grid gap-4 sm:grid-cols-[160px_1fr] shadow-xl">
          <label className="relative flex items-center justify-center h-40 sm:h-full min-h-[120px] rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary-container/70 cursor-pointer bg-surface-container/60 overflow-hidden">
            <input type="file" accept="image/*" className="hidden" onChange={handleArquivo} />
            {preview ? (
              <img src={preview} alt="pré-visualização" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center text-tertiary text-body-sm">
                <span className="material-symbols-outlined text-2xl text-primary-container">add_photo_alternate</span>
                Selecionar foto
              </span>
            )}
          </label>
          <div className="grid gap-3 content-start">
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Título (ex: “Entrega Honda Civic Touring 🚗✨”)</label>
              <input
                type="text" maxLength={150}
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary-container outline-none"
                placeholder="Título da foto"
              />
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Legenda curta (ex: “Cliente Satisfeito”)</label>
              <input
                type="text" maxLength={80}
                value={form.legenda}
                onChange={e => setForm({ ...form, legenda: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary-container outline-none"
                placeholder="Selo/legenda"
              />
            </div>
            <button
              type="submit" disabled={enviando}
              className="justify-self-start px-5 py-2.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-label-btn font-label-btn transition-colors disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : '+ Adicionar à galeria'}
            </button>
          </div>
        </form>

        {/* Lista */}
        {itens.length === 0 ? (
          <div className="text-tertiary text-body-md py-8 text-center border border-dashed border-outline-variant/30 rounded-2xl">
            Nenhuma foto na galeria ainda. A seção fica oculta no site até você adicionar a primeira.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((item, index) => (
              <div key={item.id} className={`bg-surface-container-low border rounded-2xl overflow-hidden shadow-lg ${item.ativa ? 'border-outline-variant/30' : 'border-error/30 opacity-70'}`}>
                <div className="relative aspect-square bg-surface-container">
                  <img src={mediaUrl(item.caminho_arquivo)} alt={item.titulo || 'Foto de entrega'} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <button onClick={() => mover(index, -1)} disabled={index === 0 || salvandoOrdem} title="Mover para cima/esquerda"
                      className="w-7 h-7 rounded-md bg-surface-container-lowest/80 backdrop-blur text-on-surface flex items-center justify-center border border-white/10 disabled:opacity-30">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button onClick={() => mover(index, 1)} disabled={index === itens.length - 1 || salvandoOrdem} title="Mover para baixo/direita"
                      className="w-7 h-7 rounded-md bg-surface-container-lowest/80 backdrop-blur text-on-surface flex items-center justify-center border border-white/10 disabled:opacity-30">
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-surface-container-lowest/80 backdrop-blur border border-white/10 text-on-surface">
                    #{index + 1}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    type="text" maxLength={150} value={item.titulo || ''}
                    onChange={e => atualizarCampo(item.id, 'titulo', e.target.value)}
                    onBlur={() => salvarItem(item)}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-body-sm text-on-surface focus:border-primary-container outline-none"
                    placeholder="Título"
                  />
                  <input
                    type="text" maxLength={80} value={item.legenda || ''}
                    onChange={e => atualizarCampo(item.id, 'legenda', e.target.value)}
                    onBlur={() => salvarItem(item)}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-body-sm text-primary-container focus:border-primary-container outline-none"
                    placeholder="Legenda curta"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => toggleAtiva(item)} className="flex items-center gap-1.5 text-body-sm text-tertiary hover:text-on-surface transition-colors">
                      <span className={`material-symbols-outlined text-[18px] ${item.ativa ? 'text-emerald-400' : 'text-error'}`}>
                        {item.ativa ? 'visibility' : 'visibility_off'}
                      </span>
                      {item.ativa ? 'Visível' : 'Oculta'}
                    </button>
                    <button onClick={() => excluir(item.id)} className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-error hover:border-error transition-colors" title="Excluir">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
