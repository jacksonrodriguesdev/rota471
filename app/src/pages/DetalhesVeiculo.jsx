import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { mediaUrl } from '../config';
import Footer from '../components/Footer';

export default function DetalhesVeiculo() {
  const { id } = useParams();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [lightboxAberto, setLightboxAberto] = useState(false);
  const [feedbackShare, setFeedbackShare] = useState('');
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    api.get(`/api/veiculos/${id}`)
      .then(data => {
        if (typeof data.opcionais === 'string') {
          try {
            data.opcionais = JSON.parse(data.opcionais);
          } catch {
            data.opcionais = [];
          }
        }

        setVeiculo(data);

        if (data.imagens && data.imagens.length > 0) {
          const capaIdx = data.imagens.findIndex(img => img.is_capa === 1);
          setFotoIndex(capaIdx >= 0 ? capaIdx : 0);
        } else {
          setFotoIndex(0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    api.get('/api/veiculos')
      .then(data => {
        const others = data.filter(v => v.id !== parseInt(id)).slice(0, 3);
        setRelacionados(others);
      })
      .catch(console.error);
  }, [id]);

  const imagens = veiculo?.imagens || [];
  const totalFotos = imagens.length;
  const imagemAtual = imagens[fotoIndex];

  const proximaFoto = useCallback(() => {
    if (totalFotos < 2) return;
    setFotoIndex(i => (i + 1) % totalFotos);
  }, [totalFotos]);

  const fotoAnterior = useCallback(() => {
    if (totalFotos < 2) return;
    setFotoIndex(i => (i - 1 + totalFotos) % totalFotos);
  }, [totalFotos]);

  // Navegação por teclado (setas + Esc para fechar o lightbox)
  useEffect(() => {
    if (totalFotos === 0) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') proximaFoto();
      else if (e.key === 'ArrowLeft') fotoAnterior();
      else if (e.key === 'Escape') setLightboxAberto(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalFotos, proximaFoto, fotoAnterior]);

  // Bloqueia o scroll do fundo quando o lightbox está aberto
  useEffect(() => {
    document.body.style.overflow = lightboxAberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxAberto]);

  const compartilhar = useCallback(async () => {
    const url = window.location.href;
    const titulo = veiculo ? `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao || ''}`.trim() : 'Veículo Mundo Car';
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, text: `Confira este veículo na Mundo Car: ${titulo}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setFeedbackShare('Link copiado!');
      setTimeout(() => setFeedbackShare(''), 2500);
    } catch (err) {
      if (err?.name === 'AbortError') return; // usuário cancelou o share nativo
      setFeedbackShare('Não foi possível compartilhar');
      setTimeout(() => setFeedbackShare(''), 2500);
    }
  }, [veiculo]);

  const imprimir = useCallback(() => window.print(), []);

  if (loading) return <div className="p-10 text-white">Carregando...</div>;
  if (!veiculo || veiculo.error) return <div className="p-10 text-white">Veículo não encontrado</div>;

  const precoFormatado = Number(veiculo.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const mensagemWhatsapp = encodeURIComponent(`Olá! Tenho interesse no veículo ${veiculo.marca} ${veiculo.modelo}`);

  // Especificações técnicas extras — só entram no grid se o veículo tiver o dado preenchido
  const specsExtras = [
    veiculo.carroceria && { icon: 'directions_car', label: 'Carroceria', value: veiculo.carroceria },
    veiculo.portas && { icon: 'sensor_door', label: 'Portas', value: `${veiculo.portas} portas` },
    veiculo.direcao && { icon: 'settings_input_component', label: 'Direção', value: veiculo.direcao },
    veiculo.ar_condicionado && veiculo.ar_condicionado !== 'Nenhum' && { icon: 'ac_unit', label: 'Ar-condicionado', value: veiculo.ar_condicionado },
    (veiculo.aro_tamanho || veiculo.aro_tipo) && {
      icon: 'album',
      label: 'Rodas',
      value: [veiculo.aro_tamanho && `Aro ${veiculo.aro_tamanho}`, veiculo.aro_tipo].filter(Boolean).join(' · '),
    },
    veiculo.tipo_som && { icon: 'speaker', label: 'Som / Multimídia', value: veiculo.tipo_som },
  ].filter(Boolean);

  // Selos de garantia e documentação — só os que estiverem marcados
  const selosDocumentacao = [
    veiculo.aceita_troca ? { icon: 'swap_horiz', texto: 'Aceita troca' } : null,
    veiculo.aceita_financiamento ? { icon: 'account_balance', texto: 'Aceita financiamento' } : null,
    veiculo.revisoes_em_dia ? { icon: 'build', texto: 'Revisões em dia' } : null,
    veiculo.manual_chave_reserva ? { icon: 'key', texto: 'Manual e chave reserva' } : null,
    veiculo.ipva_pago ? { icon: 'receipt_long', texto: 'IPVA em dia' } : null,
    veiculo.blindado ? { icon: 'security', texto: 'Blindado' } : null,
  ].filter(Boolean);

  return (
    <div className="dark min-h-screen bg-surface-container-lowest">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md shadow-lg shadow-black/80">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-container hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-label-btn font-label-btn">Voltar para Vitrine</span>
          </Link>
          <span className="text-label-badge font-label-badge text-outline uppercase tracking-wider hidden sm:block">
            REF: #{veiculo.id.toString().padStart(5, '0')}
          </span>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-[1320px] mx-auto">
{/* 2. Breadcrumb Navigation */}
<nav className="flex items-center gap-2 text-body-sm text-outline mb-6 overflow-x-auto whitespace-nowrap py-1">
<Link className="hover:text-primary-container transition-colors flex items-center gap-1" to="/">
<span className="material-symbols-outlined text-xs">home</span>
        Início
      </Link>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<a className="hover:text-primary-container transition-colors" href="/#estoque">Estoque</a>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-outline">{veiculo.marca}</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-on-surface font-medium">{veiculo.marca} {veiculo.modelo} {veiculo.versao}</span>
</nav>
{/* 3. Vehicle Title & Certification Header */}
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-outline-variant/30 mb-8">
<div>
<div className="flex flex-wrap items-center gap-2.5 mb-2">
{veiculo.versao && <span className="px-2.5 py-1 bg-primary-container text-on-primary-container text-label-badge font-label-badge tracking-wider rounded-lg uppercase">{veiculo.versao}</span>}
<span className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-high text-on-surface text-label-badge font-label-badge rounded-lg border border-outline-variant/40">
<span className="material-symbols-outlined text-xs text-primary-container">verified</span>
            Laudo Cautelar Aprovado
          </span>
{veiculo.garantia_tipo && veiculo.garantia_tipo !== 'Sem Garantia' ? (
  <span className="flex items-center gap-1 px-2.5 py-1 bg-surface-container text-outline text-label-badge font-label-badge rounded-lg">
    <span className="material-symbols-outlined text-xs text-primary-container">shield</span>
    {veiculo.garantia_tipo}{veiculo.garantia_meses ? ` · ${veiculo.garantia_meses} meses` : ''}
  </span>
) : (
  <span className="px-2.5 py-1 bg-surface-container text-outline text-label-badge font-label-badge rounded-lg">Garantia Mundo Car</span>
)}
</div>
<h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{veiculo.marca} {veiculo.modelo} {veiculo.versao}</h1>
<div className="flex flex-wrap items-center gap-4 mt-2 text-body-md text-outline">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span> {veiculo.ano_fabricacao}/{veiculo.ano_modelo}</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">speed</span> {Number(veiculo.quilometragem).toLocaleString()} km</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">palette</span> {veiculo.cor}</span>
{veiculo.placa && (
  <>
    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">pin</span> Final de Placa: {veiculo.placa.slice(-1)}</span>
  </>
)}
</div>
</div>
{/* Action utilities */}
<div className="flex items-center gap-3">
<div className="relative">
<button onClick={compartilhar} className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline-variant/30 hover:border-primary-container rounded-xl text-body-sm text-on-surface transition-colors">
<span className="material-symbols-outlined text-base">share</span>
<span className="hidden sm:inline">Compartilhar</span>
</button>
{feedbackShare && (
  <span className="absolute right-0 top-full mt-2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-body-sm text-on-surface shadow-lg z-10">
    {feedbackShare}
  </span>
)}
</div>
<button onClick={imprimir} className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low border border-outline-variant/30 hover:border-primary-container rounded-xl text-body-sm text-on-surface transition-colors">
<span className="material-symbols-outlined text-base">print</span>
<span className="hidden sm:inline">Imprimir</span>
</button>
</div>
</div>
{/* Main Content Grid (Media Gallery + Sticky Sidebar) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
{/* 4. Media & Gallery Column (8 Cols) */}
<div className="lg:col-span-8 flex flex-col gap-4">
{/* Main Viewport */}
<div className="relative w-full aspect-[16/10] bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/40 shadow-2xl group flex items-center justify-center">
{imagemAtual ? (
  <img
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
    alt={`${veiculo.marca} ${veiculo.modelo}`}
    src={mediaUrl(imagemAtual.caminho_arquivo)}
    onClick={() => setLightboxAberto(true)}
  />
) : (
  <div className="text-outline flex flex-col items-center">
    <span className="material-symbols-outlined text-6xl">no_photography</span>
    <span>Sem foto</span>
  </div>
)}
{/* Top Overlay Badges */}
{totalFotos > 0 && (
  <div className="absolute top-4 left-4 flex items-center gap-2">
  <span className="px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-on-surface text-label-badge font-label-badge rounded-lg flex items-center gap-1.5">
  <span className="material-symbols-outlined text-sm">photo_camera</span>
  <span>Foto {fotoIndex + 1} de {totalFotos}</span>
  </span>
  </div>
)}
{imagemAtual && (
  <div className="absolute top-4 right-4 flex items-center gap-2">
  <button onClick={() => setLightboxAberto(true)} className="w-10 h-10 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors" title="Tela Cheia">
  <span className="material-symbols-outlined text-lg">fullscreen</span>
  </button>
  </div>
)}
{/* Carousel Controls */}
{totalFotos > 1 && (
  <>
  <button onClick={fotoAnterior} aria-label="Foto anterior" className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-white transition-all shadow-lg">
  <span className="material-symbols-outlined text-xl">chevron_left</span>
  </button>
  <button onClick={proximaFoto} aria-label="Próxima foto" className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-white transition-all shadow-lg">
  <span className="material-symbols-outlined text-xl">chevron_right</span>
  </button>
  </>
)}
</div>
{/* Thumbnail Gallery Strip */}
{totalFotos > 1 && (
<div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
{imagens.map((img, idx) => (
  <button
    key={img.id ?? idx}
    onClick={() => setFotoIndex(idx)}
    aria-label={`Ver foto ${idx + 1}`}
    className={`thumb-item flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 relative transition-opacity ${fotoIndex === idx ? 'border-primary-container opacity-100' : 'border-outline-variant/40 opacity-60 hover:opacity-100'}`}
  >
    <img className="w-full h-full object-cover" src={mediaUrl(img.caminho_arquivo)} alt={`Miniatura ${idx + 1}`} loading="lazy" />
  </button>
))}
</div>
)}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined">palette</span>
</div>
<div>
<span className="text-body-sm text-outline block">Cor</span>
<span className="text-headline-sm font-headline-sm text-on-surface">{veiculo.cor}</span>
</div>
</div>
<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined">speed</span>
</div>
<div>
<span className="text-body-sm text-outline block">Quilometragem</span>
<span className="text-headline-sm font-headline-sm text-on-surface">{Number(veiculo.quilometragem).toLocaleString()} km</span>
</div>
</div>
<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined">local_gas_station</span>
</div>
<div>
<span className="text-body-sm text-outline block">Combustível</span>
<span className="text-headline-sm font-headline-sm text-on-surface">{veiculo.combustivel}</span>
</div>
</div>
<div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined">settings_suggest</span>
</div>
<div>
<span className="text-body-sm text-outline block">Câmbio</span>
<span className="text-headline-sm font-headline-sm text-on-surface">{veiculo.cambio}</span>
</div>
</div>
{specsExtras.map((spec) => (
  <div key={spec.label} className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
      <span className="material-symbols-outlined">{spec.icon}</span>
    </div>
    <div className="min-w-0">
      <span className="text-body-sm text-outline block">{spec.label}</span>
      <span className="text-headline-sm font-headline-sm text-on-surface line-clamp-1" title={spec.value}>{spec.value}</span>
    </div>
  </div>
))}
</div>

{/* Selos de Garantia & Documentação */}
{selosDocumentacao.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-1">
    {selosDocumentacao.map((selo) => (
      <span key={selo.texto} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface">
        <span className="material-symbols-outlined text-sm text-emerald-400">{selo.icon}</span>
        {selo.texto}
      </span>
    ))}
  </div>
)}
</div>

{/* 5. Sticky Action / Purchasing Column (4 Cols) */}
<div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
{/* Pricing & CTAs Card */}
<div className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 shadow-2xl relative overflow-hidden">
<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between mb-2">
  <span className="text-body-sm uppercase tracking-wider text-outline font-semibold">Preço Especial à Vista</span>
</div>
<div className="flex items-baseline gap-2 mb-2">
<span className="text-headline-sm text-primary-container font-bold">R$</span>
<span className="text-display-hero-mobile sm:text-display-hero font-display-hero text-on-surface font-extrabold tracking-tight">{precoFormatado}</span>
</div>

{/* Quick Action Buttons */}
<div className="flex flex-col gap-3 mb-6">
{/* Highlighted Red WhatsApp Button */}
<a className="relative group flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-xl font-label-btn text-label-btn shadow-lg shadow-primary-container/40 active:scale-95 transition-all text-center" href={`https://wa.me/5553999262342?text=${mensagemWhatsapp}`} target="_blank">
<span className="absolute -top-1 -right-1 flex h-3 w-3">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
<span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
</span>
<span className="material-symbols-outlined text-xl">chat</span>
<span className="">Falar no WhatsApp com Vendedor</span>
</a>
<a className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-transparent hover:bg-surface-container-high text-on-surface border border-outline-variant hover:border-primary-container rounded-xl font-label-btn text-label-btn transition-colors text-center" href={`https://wa.me/5553999262342?text=${encodeURIComponent(`Olá! Gostaria de agendar um Test Drive para o veículo ${veiculo.marca} ${veiculo.modelo} ${veiculo.versao || ''}.`)}`} target="_blank">
<span className="material-symbols-outlined text-xl">directions_car</span>
<span className="">Agendar Test Drive</span>
</a>
</div>

{/* Express Proposal / Trade-in Form */}
<div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30">
<h4 className="text-body-md font-semibold text-on-surface mb-2 flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-primary-container">swap_driving_apps</span>
                Dar Carro Usado na Troca?
              </h4>
<p className="text-body-sm text-outline mb-3">Avaliação rápida e justa do seu veículo seminovo com troco na troca.</p>
<form className="flex flex-col gap-2.5" onSubmit={(e) => {
  e.preventDefault();
  const form = e.target;
  const carroAtual = form[0].value;
  const ano = form[1].value;
  const km = form[2].value;
  const tel = form[3].value;
  const text = encodeURIComponent(`Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} e gostaria de dar meu carro na troca.\n\nMeu Carro:\nModelo: ${carroAtual}\nAno: ${ano}\nKM: ${km}\nTelefone: ${tel}`);
  window.open(`https://wa.me/5553999262342?text=${text}`, '_blank');
}}>
<input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" placeholder="Marca / Modelo do seu carro atual" required type="text"/>
<div className="grid grid-cols-2 gap-2">
<input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container outline-none" placeholder="Ano (ex: 2020)" required type="text"/>
<input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container outline-none" placeholder="KM aproximada" required type="text"/>
</div>
<input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container outline-none" placeholder="Seu Telefone / WhatsApp" required type="tel"/>
<button className="w-full mt-1 py-2.5 px-4 bg-surface-container-high hover:bg-outline-variant text-on-surface rounded-lg font-label-btn text-label-btn border border-outline-variant/40 transition-colors" type="submit">
                  Enviar para Pré-Avaliação
                </button>
</form>
</div>
</div>
{/* Dealership Location Summary */}
<div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-start gap-3">
<span className="material-symbols-outlined text-outline">location_on</span>
<div className="text-body-sm">
<span className="text-on-surface font-medium block">Showroom Mundo Car Veículos</span>
<span className="text-outline block">Av. Justino Amonte Anacker, 1102 - Brasiliano, Santa Vitória do Palmar - RS, 96230-000</span>
<span className="text-outline font-semibold mt-1 block">Contato: (53) 99926-2342</span>
</div>
</div>
</div>
</div>
{/* 6. Technical Specifications & Equipment Tabs Section */}
<section className="mb-16 bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 sm:p-8">
  <div className="flex items-center gap-2 mb-6">
    <span className="w-2 h-6 bg-primary-container rounded-sm"></span>
    <h2 className="text-headline-lg font-headline-lg text-on-surface">Principais Opcionais & Equipamentos</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
    {veiculo.opcionais && veiculo.opcionais.length > 0 ? (
      veiculo.opcionais.map((opcional, idx) => (
        <div key={idx} className="flex items-center justify-between py-2.5 border-b border-outline-variant/15 text-body-md">
          <span className="text-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
            {opcional}
          </span>
          <span className="text-on-surface font-semibold">Sim</span>
        </div>
      ))
    ) : (
      <div className="text-outline">Nenhum opcional cadastrado.</div>
    )}
  </div>

  {veiculo.descricao && (
    <div className="mt-8 pt-6 border-t border-outline-variant/20">
      <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Observações do Vendedor</h3>
      <p className="text-body-md text-outline whitespace-pre-line">{veiculo.descricao}</p>
    </div>
  )}
</section>

{/* Related Vehicles Section */}
{relacionados.length > 0 && (
  <section className="mb-16">
    <div className="flex items-center justify-between mb-8">
      <div>
        <span className="text-label-badge font-label-badge text-primary-container tracking-wider uppercase">Mais Oportunidades</span>
        <h2 className="text-headline-lg font-headline-lg text-on-surface">Veículos Semelhantes em Estoque</h2>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/" className="text-body-sm text-primary-container hover:underline flex items-center gap-1 font-semibold">
          Ver Todo o Estoque
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </div>

    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 custom-scrollbar">
      {relacionados.map(rel => {
        const fotoRel = rel.capa_imagem;

        return (
          <Link to={`/veiculo/${rel.id}`} key={rel.id} className="min-w-[42vw] sm:min-w-[35%] md:min-w-0 snap-start bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden hover:border-primary-container transition-all group shrink-0">
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-container flex items-center justify-center">
              {fotoRel ? (
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={mediaUrl(fotoRel)} alt={rel.modelo} loading="lazy" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-outline">no_photography</span>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-surface-container-lowest/80 backdrop-blur-md text-on-surface text-label-badge font-label-badge rounded-lg">
                {rel.ano_fabricacao} / {Number(rel.quilometragem).toLocaleString()} km
              </span>
            </div>
            <div className="p-4 sm:p-5">
              <span className="text-body-sm text-outline">{rel.marca}</span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface mt-0.5 truncate">{rel.modelo} {rel.versao}</h3>
              <div className="flex items-center gap-3 my-3 text-body-sm text-outline">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_gas_station</span> {rel.combustivel}</span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">settings</span> {rel.cambio}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                <div>
                  <span className="text-[14px] sm:text-price-card font-price-card text-on-surface">
                    {Number(rel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <span className="px-3.5 py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-label-btn text-label-btn transition-colors text-center">
                  Detalhes
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
)}
</main>

{/* Lightbox / Galeria em Tela Cheia */}
{lightboxAberto && imagemAtual && (
  <div
    className="fixed inset-0 z-[100] bg-black/95 flex flex-col print:hidden"
    role="dialog"
    aria-modal="true"
    onClick={() => setLightboxAberto(false)}
  >
    <div className="flex items-center justify-between px-4 sm:px-8 py-4 text-white">
      <span className="text-label-badge font-label-badge uppercase tracking-wider text-white/70">
        {veiculo.marca} {veiculo.modelo} — Foto {fotoIndex + 1} de {totalFotos}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setLightboxAberto(false); }}
        aria-label="Fechar"
        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>

    <div className="flex-1 flex items-center justify-center px-4 sm:px-16 pb-4 relative min-h-0">
      <img
        src={mediaUrl(imagemAtual.caminho_arquivo)}
        alt={`${veiculo.marca} ${veiculo.modelo} - foto ${fotoIndex + 1}`}
        className="max-h-full max-w-full object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      {totalFotos > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); fotoAnterior(); }}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-primary-container text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); proximaFoto(); }}
            aria-label="Próxima foto"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-primary-container text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>
        </>
      )}
    </div>

    {totalFotos > 1 && (
      <div className="flex items-center justify-center gap-2 px-4 pb-6 overflow-x-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        {imagens.map((img, idx) => (
          <button
            key={img.id ?? idx}
            onClick={() => setFotoIndex(idx)}
            aria-label={`Ver foto ${idx + 1}`}
            className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-opacity ${fotoIndex === idx ? 'border-primary-container opacity-100' : 'border-white/20 opacity-50 hover:opacity-100'}`}
          >
            <img className="w-full h-full object-cover" src={mediaUrl(img.caminho_arquivo)} alt={`Miniatura ${idx + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
    )}
  </div>
)}

{/* FOOTER */}
<Footer />
    </div>
  );
}
