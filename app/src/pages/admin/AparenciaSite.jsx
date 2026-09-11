import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { mediaUrl } from '../../config';

export default function AparenciaSite() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [preview, setPreview] = useState('');

  const carregar = () => {
    api.get('/api/config')
      .then(data => { setConfig(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { carregar(); }, []);

  const enviarHero = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('imagem', file);
      await api.upload('/api/config/imagem/hero_imagem', fd);
      setPreview('');
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao enviar imagem.');
      setPreview('');
    } finally {
      setEnviando(false);
      e.target.value = '';
    }
  };

  const restaurarHero = async () => {
    if (!window.confirm('Voltar a imagem de fundo do Hero para a padrão?')) return;
    try {
      await api.del('/api/config/imagem/hero_imagem');
      carregar();
    } catch (err) {
      alert(err.message || 'Erro ao restaurar.');
    }
  };

  if (loading) return <div className="p-8 text-on-surface">Carregando...</div>;

  const heroAtual = config.hero_imagem;
  const heroSrc = preview || (heroAtual ? mediaUrl(heroAtual) : '/hero.jpeg');

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 w-full">
      <section className="space-y-5 max-w-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">wallpaper</span>
            <h2 className="text-headline-md font-headline-md text-on-surface">Aparência do Site</h2>
          </div>
          <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
            Imagens que aparecem na página inicial.
          </p>
        </div>

        {/* Hero background */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">Imagem de fundo do Hero</h3>
            <p className="text-body-sm text-tertiary mt-0.5">
              Fundo da primeira dobra da Home (atrás do título). Recomendado: paisagem, no mínimo 1920×1080. Um filtro escuro é aplicado por cima automaticamente.
            </p>
          </div>

          <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container">
            <img src={heroSrc} alt="Prévia do Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <span className="text-label-badge font-label-badge uppercase tracking-wider text-primary-container">Prévia</span>
              <span className="text-headline-lg font-headline-lg text-white max-w-md leading-tight">
                Os Melhores Seminovos e Usados com Garantia
              </span>
            </div>
            {enviando && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-body-md">
                Enviando...
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-label-btn font-label-btn transition-colors cursor-pointer inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">upload</span>
              {heroAtual ? 'Trocar imagem' : 'Enviar imagem'}
              <input type="file" accept="image/*" className="hidden" onChange={enviarHero} disabled={enviando} />
            </label>
            {heroAtual && (
              <button onClick={restaurarHero} className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface hover:border-primary-container text-label-btn font-label-btn transition-colors">
                Restaurar padrão
              </button>
            )}
            <span className="text-body-sm text-tertiary">
              {heroAtual ? 'Usando imagem personalizada.' : 'Usando a imagem padrão do tema.'}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
