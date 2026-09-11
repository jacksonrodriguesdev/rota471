import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { mediaUrl } from '../config';

function App() {
  const [veiculos, setVeiculos] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroPreco, setFiltroPreco] = useState('');
  const [filtroCambio, setFiltroCambio] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [galeria, setGaleria] = useState([]);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get('/api/veiculos')
      .then(data => setVeiculos(data))
      .catch(err => console.error('Erro ao buscar veículos:', err));

    api.get('/api/galeria')
      .then(data => setGaleria(data))
      .catch(err => console.error('Erro ao buscar galeria:', err));

    api.get('/api/config')
      .then(data => setConfig(data))
      .catch(err => console.error('Erro ao buscar config:', err));
  }, []);

  // Slider da galeria de entregas
  const sliderRef = useRef(null);
  const [sliderPos, setSliderPos] = useState({ inicio: true, fim: false });

  const atualizarSliderPos = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setSliderPos({
      inicio: el.scrollLeft <= 4,
      fim: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  const avancarSlider = useCallback((dir) => {
    const el = sliderRef.current;
    if (!el) return;
    const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && noFim) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (galeria.length < 2) return;
    atualizarSliderPos();

    const el = sliderRef.current;
    let timer = setInterval(() => avancarSlider(1), 5000);
    const pausar = () => clearInterval(timer);
    const retomar = () => { clearInterval(timer); timer = setInterval(() => avancarSlider(1), 5000); };

    el?.addEventListener('mouseenter', pausar);
    el?.addEventListener('mouseleave', retomar);
    return () => {
      clearInterval(timer);
      el?.removeEventListener('mouseenter', pausar);
      el?.removeEventListener('mouseleave', retomar);
    };
  }, [galeria.length, atualizarSliderPos, avancarSlider]);

  // Marcas únicas extraídas do estoque real
  const marcasUnicas = [...new Set(veiculos.map(v => v.marca))].sort();

  // Filtragem
  const veiculosFiltrados = veiculos.filter(v => {
    if (filtroMarca && v.marca.toLowerCase() !== filtroMarca.toLowerCase()) return false;
    if (filtroModelo && !(v.modelo.toLowerCase().includes(filtroModelo.toLowerCase()) || (v.versao && v.versao.toLowerCase().includes(filtroModelo.toLowerCase())))) return false;
    if (filtroAno && v.ano_fabricacao < parseInt(filtroAno)) return false;
    if (filtroPreco) {
      const limite = parseInt(filtroPreco);
      if (Number(v.preco) > limite) return false;
    }
    if (filtroCambio && v.cambio.toLowerCase() !== filtroCambio.toLowerCase()) return false;
    return true;
  });

  // Ordenação
  const veiculosOrdenados = [...veiculosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'menor_preco': return Number(a.preco) - Number(b.preco);
      case 'maior_preco': return Number(b.preco) - Number(a.preco);
      case 'menor_km': return Number(a.quilometragem) - Number(b.quilometragem);
      default: return b.id - a.id; // recentes
    }
  });

  const limparFiltros = () => {
    setFiltroMarca('');
    setFiltroModelo('');
    setFiltroAno('');
    setFiltroPreco('');
    setFiltroCambio('');
  };

  const temFiltroAtivo = filtroMarca || filtroModelo || filtroAno || filtroPreco || filtroCambio;

  return (
    <div className="dark">
      
{/* TOPNAVBAR (Shared Component Implementation) */}
<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 w-full border-b border-outline-variant/20 bg-surface-container-lowest/90 dark:bg-surface-container-lowest/90 backdrop-blur-md shadow-2xl shadow-black/80">
<div className="flex items-center gap-8">
{/* Brand Logo */}
<a className="flex items-center gap-2" href="#"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMuypFnljzMn89KQ5kPYzOyibbATjduEZD9TPHihUKOd9QlUJtL_sUz3uilmfbyEtTrHrjOXr7KZw91DGSMB6ci963BW6-ZuWSA6TB8CFnixEMUplt1fgcvSHLq13pAXQgjKvzqMWkbWiPjJT7VBnt86M7vvwvRAq7Y6lUJi3PNDHb6d5_Sg7hI0DidCw1X8oU432CVzw9P8fW8jHsoidg3e9bfopbb8ekJLKmgiHAepmWakEQEWTeJ3nhQSCslYT5XJ8" alt="Mundo Car Veículos" className="h-10 w-auto object-contain" /></a>
{/* Desktop Nav Links */}
<nav className="hidden lg:flex items-center gap-6">
<a className="text-primary-container dark:text-primary-container border-b-2 border-primary-container font-bold pb-1 text-label-btn font-label-btn" href="#inicio">Início</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#estoque">Estoque</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#venda">Venda seu Carro</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#sobre">Sobre Nós</a>
</nav>
</div>
{/* Actions */}
<div className="flex items-center gap-3">
{/* Instagram Handle Shortcut */}
<a className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-btn font-label-btn transition-colors border border-outline-variant/30" href="https://instagram.com/mund0_car_veiculos" target="_blank">
<span className="material-symbols-outlined text-primary-container text-lg" data-icon="photo_camera">photo_camera</span>
<span className="text-body-sm font-body-sm text-on-surface">@mund0_car_veiculos</span>
</a>

{/* WhatsApp CTA Button */}
<a className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-white font-label-btn text-label-btn shadow-lg shadow-primary-container/30 transition-all duration-200 active:scale-95" href="https://wa.me/5553999262342" target="_blank">
<span className="material-symbols-outlined text-lg" data-icon="chat">chat</span>
<span className="">WhatsApp</span>
</a>
</div>
</header>
{/* HERO SECTION */}
<section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-outline-variant/20" id="inicio">
{/* Background Image */}
<div className="absolute inset-0">
  <img src={config.hero_imagem ? mediaUrl(config.hero_imagem) : '/hero.jpeg'} alt="" className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-black/70"></div>
</div>
{/* Atmospheric Red Kinetic Glows */}
<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-primary-container/15 blur-[140px] pointer-events-none rounded-full"></div>
<div className="absolute -top-20 right-0 w-96 h-96 bg-primary-container/10 blur-[100px] pointer-events-none rounded-full"></div>
<div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
{/* Top Badges Row */}
<div className="flex flex-wrap items-center gap-3 mb-6">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-container/20 border border-primary-container text-white text-label-badge font-label-badge uppercase tracking-wider">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="verified" >verified</span>
          Laudo Cautelar 100% Aprovado
        </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface text-label-badge font-label-badge uppercase tracking-wider">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="shield">shield</span>
          Garantia de Motor e Câmbio
        </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface text-label-badge font-label-badge uppercase tracking-wider">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="local_shipping">local_shipping</span>
          Entrega em Todo o Brasil
        </span>
</div>
{/* Hero Headline & Subtitle */}
<div className="max-w-3xl mb-10">
<h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-white mb-4 leading-tight">
          Os Melhores Seminovos e Usados com <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-on-surface to-primary-container">Garantia e Procedência</span>
</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
          Estoque criteriosamente periciado, quilometragem real certificada e aprovação facilitada com mais de 15 financeiras conveniadas. Encontre hoje o veículo ideal para sua rotina ou alta performance.
        </p>
</div>
{/* Quick Search Aggregation Chassis */}
<div className="bg-surface-container-low/95 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-4 sm:p-6 shadow-2xl shadow-black/80 mb-8">
<form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
{/* Marca */}
<div className="flex flex-col gap-1.5">
<label className="text-label-badge font-label-badge text-on-surface-variant uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="directions_car">directions_car</span>
              Marca
            </label>
<select className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md font-body-md text-white focus:outline-none focus:border-primary-container transition-all" value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)}>
<option value="">Todas as Marcas</option>
{marcasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
</select>
</div>
{/* Modelo */}
<div className="flex flex-col gap-1.5">
<label className="text-label-badge font-label-badge text-on-surface-variant uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="speed">speed</span>
              Modelo ou Versão
            </label>
<input className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md font-body-md text-white placeholder:text-outline-variant focus:outline-none focus:border-primary-container transition-all" placeholder="Ex: Civic, Corolla, Compass..." type="text" value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)} />
</div>
{/* Ano */}
<div className="flex flex-col gap-1.5">
<label className="text-label-badge font-label-badge text-on-surface-variant uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="calendar_month">calendar_month</span>
              Ano a partir de
            </label>
<select className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md font-body-md text-white focus:outline-none focus:border-primary-container transition-all" value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
<option value="">Qualquer Ano</option>
<option value="2024">2024</option>
<option value="2023">2023</option>
<option value="2022">2022</option>
<option value="2021">2021</option>
<option value="2020">2020</option>
<option value="2018">2018</option>
</select>
</div>
{/* Faixa de Preço */}
<div className="flex flex-col gap-1.5">
<label className="text-label-badge font-label-badge text-on-surface-variant uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-sm text-primary-container" data-icon="payments">payments</span>
              Preço Máximo
            </label>
<select className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2.5 text-body-md font-body-md text-white focus:outline-none focus:border-primary-container transition-all" value={filtroPreco} onChange={e => setFiltroPreco(e.target.value)}>
<option value="">Sem limite</option>
<option value="80000">Até R$ 80.000</option>
<option value="120000">Até R$ 120.000</option>
<option value="160000">Até R$ 160.000</option>
<option value="220000">Até R$ 220.000</option>
<option value="350000">Até R$ 350.000</option>
</select>
</div>
{/* Submit Button */}
<button className="w-full h-[42px] bg-primary-container hover:bg-secondary-container text-white font-label-btn text-label-btn rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-container/30 hover:shadow-primary-container/50 transition-all active:scale-95" type="button" onClick={() => document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' })}>
<span className="material-symbols-outlined text-lg" data-icon="search">search</span>
<span className="">Buscar Veículos</span>
</button>
</form>
</div>
{/* Quick Brand Chips Rails */}
<div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
<span className="text-label-badge font-label-badge uppercase tracking-wider text-outline whitespace-nowrap">Principais Marcas:</span>
{marcasUnicas.map(m => (
  <button key={m} onClick={() => { setFiltroMarca(filtroMarca === m ? '' : m); document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' }); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-body-sm font-body-sm transition-all whitespace-nowrap ${filtroMarca === m ? 'bg-primary-container border-primary-container text-white shadow-md shadow-primary-container/30' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-white'}`}>
    <span className="font-bold">{m.toUpperCase()}</span>
  </button>
))}
</div>
</div>
</section>
{/* QUICK CATEGORY FILTERS BAR */}
<section className="sticky top-[57px] z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 py-3 shadow-lg shadow-black/60">
<div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
{/* Filter Chips */}
<div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
<button onClick={limparFiltros} className={`px-4 py-1.5 rounded-lg font-label-btn text-label-btn whitespace-nowrap transition-colors ${!temFiltroAtivo ? 'bg-primary-container text-white shadow-md shadow-primary-container/30' : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'}`}>
          Todos ({veiculos.length})
</button>
{marcasUnicas.map(m => {
  const count = veiculos.filter(v => v.marca === m).length;
  return (
    <button key={m} onClick={() => { setFiltroMarca(filtroMarca === m ? '' : m); setFiltroCambio(''); }} className={`px-4 py-1.5 rounded-lg font-label-btn text-label-btn whitespace-nowrap transition-colors ${filtroMarca === m ? 'bg-primary-container text-white shadow-md shadow-primary-container/30' : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'}`}>
      {m} ({count})
    </button>
  );
})}
<button onClick={() => { setFiltroCambio(filtroCambio === 'Automático' ? '' : 'Automático'); }} className={`px-4 py-1.5 rounded-lg font-label-btn text-label-btn whitespace-nowrap transition-colors flex items-center gap-1.5 ${filtroCambio === 'Automático' ? 'bg-primary-container text-white shadow-md shadow-primary-container/30' : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'}`}>
<span className="material-symbols-outlined text-xs" data-icon="settings">settings</span>
          Câmbio Automático
</button>
</div>
{/* Counter and Order dropdown */}
<div className="hidden md:flex items-center gap-3 whitespace-nowrap pl-4 border-l border-outline-variant/30">
<span className="text-body-sm font-body-sm text-outline">{veiculosOrdenados.length} veículo{veiculosOrdenados.length !== 1 ? 's' : ''}</span>
<select className="bg-surface-container text-body-sm font-body-sm text-white rounded-lg px-2.5 py-1.5 border border-outline-variant/40 focus:outline-none focus:border-primary-container" value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
<option value="recentes">Mais Recentes</option>
<option value="menor_preco">Menor Preço</option>
<option value="maior_preco">Maior Preço</option>
<option value="menor_km">Menor KM</option>
</select>
</div>
</div>
</section>
{/* MAIN SHOWCASE GRID (VITRINE VIRTUAL - EXACTLY 20 VEHICLES) */}
<main className="py-12 bg-surface-container-lowest" id="estoque">
<div className="max-w-[1320px] mx-auto px-4 sm:px-6">
{/* Section Header */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<div className="flex items-center gap-2 text-primary-container text-label-badge font-label-badge uppercase tracking-wider mb-1">
<span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Estoque Atualizado em Tempo Real
          </div>
<h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-white">
            Vitrine Virtual de Veículos Disponíveis
          </h2>
</div>
<p className="text-body-sm font-body-sm text-outline max-w-md md:text-right">
          Todos os veículos acompanham Laudo Pericial Cautelar aprovado, revisão mecânica preventiva completa e documentação 100% regularizada.
        </p>
</div>
{/* 20-CARD BENTO-ALIGNED RESPONSIVE GRID (4 cols x 5 rows) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {veiculosOrdenados.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <span className="material-symbols-outlined text-6xl text-outline mb-4 block">search_off</span>
                <p className="text-white text-headline-sm font-headline-sm mb-2">Nenhum veículo encontrado</p>
                <p className="text-outline text-body-md mb-6">Tente ajustar os filtros para encontrar o que procura.</p>
                <button onClick={limparFiltros} className="px-6 py-2.5 rounded-lg bg-primary-container hover:bg-secondary-container text-white font-label-btn text-label-btn transition-all">Limpar Filtros</button>
              </div>
            ) : (
              veiculosOrdenados.map(veiculo => (
                <div key={veiculo.id} className="group bg-surface-container-low border border-outline-variant/30 hover:border-primary-container/60 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary-container/15 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden bg-surface-container flex items-center justify-center">
                    {veiculo.capa_imagem ? (
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={veiculo.modelo} src={mediaUrl(veiculo.capa_imagem)} />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-outline">directions_car</span>
                    )}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 text-white text-label-badge font-label-badge">{veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-body-sm font-body-sm text-outline uppercase tracking-wider font-semibold">{veiculo.marca}</span>
                      <h3 className="text-headline-sm font-headline-sm text-white line-clamp-1 group-hover:text-primary transition-colors">{veiculo.modelo} {veiculo.versao}</h3>
                      <div className="flex items-center gap-1.5 my-3 flex-wrap">
                        <span className="px-2 py-1 rounded bg-surface-container text-spec-metric font-spec-metric text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary-container" data-icon="speed">speed</span> {Number(veiculo.quilometragem).toLocaleString()} km
                        </span>
                        <span className="px-2 py-1 rounded bg-surface-container text-spec-metric font-spec-metric text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary-container" data-icon="settings">settings</span> {veiculo.cambio}
                        </span>
                        <span className="px-2 py-1 rounded bg-surface-container text-spec-metric font-spec-metric text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary-container" data-icon="local_gas_station">local_gas_station</span> {veiculo.combustivel}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-outline-variant/20">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-price-card font-price-card text-white">R$ {Number(veiculo.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/veiculo/${veiculo.id}`} className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-white text-label-btn font-label-btn text-center transition-colors flex items-center justify-center">Detalhes</Link>
                        <a className="w-full py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-white text-label-btn font-label-btn flex items-center justify-center gap-1 shadow-md shadow-primary-container/20 transition-all" href={`https://wa.me/5553999262342?text=Interesse ${veiculo.marca} ${veiculo.modelo}`} target="_blank">
                          <span className="material-symbols-outlined text-sm" data-icon="chat">chat</span> Proposta
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
{/* STORE DIFFERENTIALS & FINANCING WIDGET */}
<section className="py-16 bg-surface border-t border-b border-outline-variant/20 relative overflow-hidden" id="financiamento">
<div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
{/* Differentials Bento Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
<div className="p-6 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container transition-colors">
<div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-2xl" data-icon="sync_alt">sync_alt</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-white mb-2">Avaliação Justa na Troca</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant">Valorizamos seu veículo usado com base no mercado real, permitindo usá-lo como entrada integral imediata.</p>
</div>
<div className="p-6 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container transition-colors">
<div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-2xl" data-icon="account_balance">account_balance</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-white mb-2">+15 Financeiras Integradas</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant">Parcerias com Itaú, Santander, Bradesco, BV, PAN e Safra para garantir as menores taxas e aprovação descomplicada.</p>
</div>
<div className="p-6 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container transition-colors">
<div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-2xl" data-icon="verified_user">verified_user</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-white mb-2">Laudo Cautelar 100%</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant">Nenhum veículo de leilão, sinistro ou histórico duvidoso. Todos os itens mecânicos e estruturais minuciosamente verificados.</p>
</div>
<div className="p-6 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container transition-colors">
<div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-2xl" data-icon="local_shipping">local_shipping</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-white mb-2">Entrega para Todo Brasil</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant">Logística com seguro total para embarque e entrega expressa diretamente na sua residência ou empresa.</p>
</div>
</div>

</div>
</section>
{/* INSTAGRAM COMMUNITY & REVIEWS FEED SECTION */}
{galeria.length > 0 && (
<section className="py-16 bg-surface-container-lowest border-b border-outline-variant/20">
<div className="max-w-[1320px] mx-auto px-4 sm:px-6">
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
<div>
<div className="flex items-center gap-2 text-primary-container text-label-badge font-label-badge uppercase tracking-wider mb-1">
<span className="material-symbols-outlined text-sm" data-icon="photo_camera">photo_camera</span>
            Transparência em Cada Entrega
          </div>
<h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-white">
            Siga nosso Instagram <a className="text-primary-container hover:underline" href="https://instagram.com/mund0_car_veiculos" target="_blank">@mund0_car_veiculos</a>
</h2>
</div>
<a className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-white font-label-btn text-label-btn flex items-center gap-2" href="https://instagram.com/mund0_car_veiculos" target="_blank">
<span className="">Ver Perfil Oficial</span>
<span className="material-symbols-outlined text-sm" data-icon="arrow_outward">arrow_outward</span>
</a>
</div>
{/* Slider de Entregas */}
<div className="relative">
{galeria.length > 1 && (
  <>
    <button
      onClick={() => avancarSlider(-1)}
      disabled={sliderPos.inicio}
      aria-label="Entregas anteriores"
      className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/40 text-white items-center justify-center hover:bg-primary-container transition-colors shadow-lg disabled:opacity-30 disabled:hover:bg-surface-container-high"
    >
      <span className="material-symbols-outlined">chevron_left</span>
    </button>
    <button
      onClick={() => avancarSlider(1)}
      disabled={sliderPos.fim}
      aria-label="Próximas entregas"
      className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/40 text-white items-center justify-center hover:bg-primary-container transition-colors shadow-lg disabled:opacity-30 disabled:hover:bg-surface-container-high"
    >
      <span className="material-symbols-outlined">chevron_right</span>
    </button>
  </>
)}

<div
  ref={sliderRef}
  onScroll={atualizarSliderPos}
  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
{galeria.map(foto => (
  <div key={foto.id} className="group relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 aspect-square snap-start shrink-0 w-[78%] sm:w-[46%] md:w-[31.5%] lg:w-[23.5%]">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={mediaUrl(foto.caminho_arquivo)} alt={foto.titulo || 'Entrega Mundo Car'} loading="lazy" />
    {(foto.titulo || foto.legenda) && (
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
        {foto.titulo && <p className="text-body-sm font-body-sm text-white font-medium">{foto.titulo}</p>}
        {foto.legenda && <span className="text-label-badge font-label-badge text-primary-container">{foto.legenda}</span>}
      </div>
    )}
  </div>
))}
</div>
</div>
</div>
</section>
)}
{/* FOOTER (Shared Component Implementation) */}
<footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/30 dark:border-outline-variant/30 pt-16 pb-12" id="sobre">
<div className="w-full px-6 max-w-container-max mx-auto">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
{/* Brand Summary */}
<div className="lg:col-span-2">
<div className="mb-4"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt5LspIkqUFnqQiE6d9B5VA_7KFdijgnOd8YVj6mIvQXDNl9Glrvdz019Z6yG72y0ta0IwOrHjM7qImrWmeHzRmNo3vwE6OIaE2cV3ECaoNK_vvKbhoEQHRXh6yNeA52O8554aNPeiA2BtmUPbYKRDJc5139Xw0F1x71AWsaT97Y4YPv8z4ATfgq6Kj280cNXYXT8PzI1qqM7J9iu-OG4uyO1SYfsjA5bbTgLflIo7DyEA6sqNrqFTslp52BQFkGP5aoA" alt="Mundo Car Veículos" className="h-12 w-auto object-contain" /></div>
<p className="text-body-sm font-body-sm text-on-surface-variant max-w-sm mb-6">
            Especialistas em seminovos periciados e veículos selecionados com total transparência mecânica, documentação blindada e atendimento ágil.
          </p>
<div className="flex items-center gap-3">
<a className="w-9 h-9 rounded-lg bg-surface-container hover:bg-primary-container text-white flex items-center justify-center transition-colors" href="https://instagram.com/mund0_car_veiculos" target="_blank">
<span className="material-symbols-outlined text-sm" data-icon="photo_camera">photo_camera</span>
</a>
<a className="w-9 h-9 rounded-lg bg-surface-container hover:bg-primary-container text-white flex items-center justify-center transition-colors" href="https://wa.me/5553999262342" target="_blank">
<span className="material-symbols-outlined text-sm" data-icon="chat">chat</span>
</a>
<a className="w-9 h-9 rounded-lg bg-surface-container hover:bg-primary-container text-white flex items-center justify-center transition-colors" href="mailto:contato@mundocarveiculos.com.br">
<span className="material-symbols-outlined text-sm" data-icon="mail">mail</span>
</a>
</div>
</div>
{/* Links Column 1 */}
<div>
<h4 className="text-headline-sm font-headline-sm text-white mb-4">Navegação</h4>
<ul className="space-y-2 text-body-sm font-body-sm">
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#estoque">Estoque Completo</a></li>
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#venda">Avalie seu Usado</a></li>
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#inicio">Garantia e Laudo Cautelar</a></li>
</ul>
</div>
{/* Links Column 2 */}
<div>
<h4 className="text-headline-sm font-headline-sm text-white mb-4">Institucional</h4>
<ul className="space-y-2 text-body-sm font-body-sm">
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#">Sobre a Loja</a></li>
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#">Termos de Uso</a></li>
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#">Política de Privacidade</a></li>
</ul>
</div>
{/* Store Info / Hours */}
<div>
<h4 className="text-headline-sm font-headline-sm text-white mb-4">Showroom</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-2 flex items-start gap-2">
<span className="material-symbols-outlined text-primary-container text-sm mt-0.5" data-icon="location_on">location_on</span>
<span className="">Av. Justino Amonte Anacker, 1102 - Brasiliano<br/>Santa Vitória do Palmar - RS, 96230-000</span>
</p>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-2 flex items-start gap-2">
<span className="material-symbols-outlined text-primary-container text-sm mt-0.5" data-icon="schedule">schedule</span>
<span className="">Seg a Sex: 08:30 - 19:00<br />Sábados: 09:00 - 16:00</span>
</p>
</div>
</div>
{/* Sub Footer / Copyright */}
<div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
<p className="text-body-sm font-body-sm text-outline text-center md:text-left">
          © 2024 Mundo Car Veículos. Todos os direitos reservados. Excelência e procedência em seminovos.
        </p>
<div className="flex items-center gap-4 text-label-badge font-label-badge text-outline uppercase tracking-wider">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Showroom Aberto</span>
<span className="">CNPJ: 00.000.000/0001-00</span>
</div>
</div>
</div>
</footer>
{/* FLOATING SPEED ACTION (WHATSAPP PILL) */}
<aside className="fixed bottom-6 right-6 z-50">
<a className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary-container hover:bg-secondary-container text-white shadow-2xl shadow-primary-container/50 border border-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 group" href="https://wa.me/5553999262342?text=Ol%C3%A1%2C+estou+no+site+e+gostaria+de+atendimento" target="_blank">
<span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform" data-icon="chat">chat</span>
<div className="flex flex-col text-left">
<span className="text-label-badge font-label-badge uppercase tracking-wider text-white/80">Atendimento Online</span>
<span className="text-label-btn font-label-btn leading-none">Fale com Consultor</span>
</div>
</a>
</aside>





    </div>
  );
}

export default App;
