import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { mediaUrl } from '../../config';

const FORM_INICIAL = {
  marca: 'Chevrolet',
  modelo: '',
  versao: '',
  placa: '',
  ano_fabricacao: '',
  ano_modelo: '',
  quilometragem: '',
  cor: '',
  cambio: 'Automático',
  combustivel: 'Flex',
  preco: '',
  // Bloco E — Especificações Técnicas
  carroceria: '',
  portas: '',
  direcao: '',
  ar_condicionado: '',
  tipo_som: '',
  aro_tamanho: '',
  aro_tipo: '',
  // Bloco F — Garantia & Documentação
  garantia_tipo: '',
  garantia_meses: '',
  blindado: false,
  ipva_pago: false,
  aceita_troca: true,
  aceita_financiamento: true,
  revisoes_em_dia: false,
  manual_chave_reserva: false,
};

const TOGGLES_GARANTIA = [
  { campo: 'aceita_troca', label: 'Aceita troca por outro veículo' },
  { campo: 'aceita_financiamento', label: 'Aceita financiamento' },
  { campo: 'revisoes_em_dia', label: 'Revisões em dia (concessionária)' },
  { campo: 'manual_chave_reserva', label: 'Manual e chave reserva' },
  { campo: 'ipva_pago', label: 'IPVA do ano pago' },
  { campo: 'blindado', label: 'Veículo blindado' },
];

export default function CadastroVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [opcionaisCatalogo, setOpcionaisCatalogo] = useState([]);
  const [opcionais, setOpcionais] = useState([]);

  useEffect(() => {
    // Carregar marcas
    api.get('/api/marcas')
      .then(data => {
        const marcasAtivas = data.filter(m => m.ativa);
        setMarcas(marcasAtivas);
        if (marcasAtivas.length > 0 && formData.marca === 'Chevrolet' && !isEditMode) {
          setFormData(prev => ({ ...prev, marca: marcasAtivas[0].nome }));
        }
      })
      .catch(err => console.error('Erro ao buscar marcas:', err));

    // Carregar catálogo de opcionais
    api.get('/api/opcionais')
      .then(data => setOpcionaisCatalogo(data))
      .catch(err => console.error('Erro ao buscar opcionais:', err));

    // Se estiver em modo edição, carregar dados do veículo
    if (isEditMode) {
      api.get(`/api/veiculos/${id}`)
        .then(data => {
          setFormData({
            marca: data.marca || '',
            modelo: data.modelo || '',
            versao: data.versao || '',
            placa: data.placa || '',
            ano_fabricacao: data.ano_fabricacao || '',
            ano_modelo: data.ano_modelo || '',
            quilometragem: data.quilometragem || '',
            cor: data.cor || '',
            cambio: data.cambio || 'Automático',
            combustivel: data.combustivel || 'Flex',
            preco: data.preco || '',
            carroceria: data.carroceria || '',
            portas: data.portas || '',
            direcao: data.direcao || '',
            ar_condicionado: data.ar_condicionado || '',
            tipo_som: data.tipo_som || '',
            aro_tamanho: data.aro_tamanho || '',
            aro_tipo: data.aro_tipo || '',
            garantia_tipo: data.garantia_tipo || '',
            garantia_meses: data.garantia_meses || '',
            blindado: !!data.blindado,
            ipva_pago: !!data.ipva_pago,
            aceita_troca: data.aceita_troca === undefined ? true : !!data.aceita_troca,
            aceita_financiamento: data.aceita_financiamento === undefined ? true : !!data.aceita_financiamento,
            revisoes_em_dia: !!data.revisoes_em_dia,
            manual_chave_reserva: !!data.manual_chave_reserva,
          });
          if (data.opcionais) setOpcionais(data.opcionais);
          if (data.imagens) {
            const loadedImages = data.imagens.map(img => ({
              id: img.id,
              preview: mediaUrl(img.caminho_arquivo),
              isCapa: img.is_capa === 1,
              isExisting: true
            }));
            setImages(loadedImages);
          }
        })
        .catch(err => console.error('Erro ao buscar veículo:', err));
    }
  }, [id]);

  // Agrupa o catálogo de opcionais por categoria, preservando a ordem que veio da API
  const opcionaisPorCategoria = opcionaisCatalogo.reduce((acc, op) => {
    (acc[op.categoria] = acc[op.categoria] || []).push(op);
    return acc;
  }, {});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpcionalChange = (opcao) => {
    setOpcionais(prev =>
      prev.includes(opcao) ? prev.filter(o => o !== opcao) : [...prev, opcao]
    );
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isCapa: images.length === 0, // Primeira imagem vira capa
      }));
      setImages((prev) => [...prev, ...newFiles]);
      // IMPORTANTE: reseta o valor do input para permitir selecionar o mesmo arquivo novamente
      e.target.value = null;
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setCapa = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isCapa: i === index }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Adicionar opcionais como JSON string ou array
      data.append('opcionais', JSON.stringify(opcionais));

      const keptExistingImages = images.filter(img => img.isExisting).map(img => img.id);
      data.append('keptImages', JSON.stringify(keptExistingImages));

      // Passar o ID ou índice de quem é a capa
      const capaIndex = images.findIndex(img => img.isCapa);
      if (capaIndex !== -1) {
        if (images[capaIndex].isExisting) {
          data.append('capaExistingId', images[capaIndex].id);
        } else {
          // As novas fotos serão enviadas juntas, então pegamos o índice delas filtrando só as novas
          const novas = images.filter(img => !img.isExisting);
          const idxNova = novas.findIndex(img => img.isCapa);
          if (idxNova !== -1) data.append('capaNewIndex', idxNova);
        }
      }

      images.forEach((img) => {
        if (!img.isExisting && img.file) {
          data.append('imagens', img.file);
        }
      });


      const path = isEditMode ? `/api/veiculos/${id}` : '/api/veiculos';
      const method = isEditMode ? 'PUT' : 'POST';

      await api.upload(path, data, method);

      alert(isEditMode ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
      if (isEditMode) {
        navigate('/dashboard/veiculos');
      } else {
        setFormData(FORM_INICIAL);
        setImages([]);
        setOpcionais([]);
      }
    } catch (error) {
      alert(error.message || 'Erro ao salvar veículo. Verifique se o backend está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6 md:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-2xl relative" id="cadastro-veiculo">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-container animate-pulse"></span>
            <span className="text-label-badge font-label-badge text-primary-container uppercase tracking-wider">FORMULÁRIO DE ENTRADA</span>
          </div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight mt-1">
            {isEditMode ? 'Editar Veículo do Estoque' : 'Novo Veículo & Cadastro'}
          </h2>
        </div>
      </div>

      <form className="space-y-8 mt-6" onSubmit={handleSubmit}>
        {/* BLOCO A */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary-container">badge</span>
            <h3>Bloco A — Dados Básicos</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Marca *</label>
              <select name="marca" value={formData.marca} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                {marcas.length === 0 ? <option>Carregando marcas...</option> : null}
                {marcas.map(m => (
                  <option key={m.id} value={m.nome}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Modelo *</label>
              <input required name="modelo" value={formData.modelo} onChange={handleInputChange} type="text" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="Ex: Onix Plus LTZ"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Versão *</label>
              <input required name="versao" value={formData.versao} onChange={handleInputChange} type="text" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="Ex: 1.0 Turbo"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Placa *</label>
              <input required name="placa" value={formData.placa} onChange={handleInputChange} type="text" className="w-full uppercase font-mono px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="ABC1D23"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Ano Fab. *</label>
              <input required name="ano_fabricacao" value={formData.ano_fabricacao} onChange={handleInputChange} type="number" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="2023"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Ano Mod. *</label>
              <input required name="ano_modelo" value={formData.ano_modelo} onChange={handleInputChange} type="number" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="2024"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Km *</label>
              <input required name="quilometragem" value={formData.quilometragem} onChange={handleInputChange} type="number" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="38000"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Cor *</label>
              <input required name="cor" value={formData.cor} onChange={handleInputChange} type="text" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="Prata"/>
            </div>

            {/* Adicionados Câmbio e Combustível */}
            <div className="grid grid-cols-2 gap-2 lg:col-span-2">
              <div>
                <label className="block text-body-sm text-tertiary mb-1">Câmbio</label>
                <select name="cambio" value={formData.cambio} onChange={handleInputChange} className="w-full px-2.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm">
                  <option>Automático</option>
                  <option>Manual</option>
                  <option>CVT</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm text-tertiary mb-1">Combustível</label>
                <select name="combustivel" value={formData.combustivel} onChange={handleInputChange} className="w-full px-2.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm">
                  <option>Flex (Álcool/Gasolina)</option>
                  <option>Gasolina</option>
                  <option>Diesel</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO B */}
        <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-emerald-400">payments</span>
            <h3>Bloco B — Precificação</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm text-primary-container font-semibold mb-1">Preço de Venda *</label>
              <input required name="preco" value={formData.preco} onChange={handleInputChange} type="number" step="0.01" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border-2 border-primary-container/70 text-on-surface focus:border-primary-container" placeholder="78900.00"/>
            </div>
          </div>
        </div>

        {/* BLOCO E: ESPECIFICAÇÕES TÉCNICAS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary-container">settings_suggest</span>
            <h3>Bloco E — Especificações Técnicas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Carroceria</label>
              <select name="carroceria" value={formData.carroceria} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option>Hatch</option>
                <option>Sedã</option>
                <option>SUV</option>
                <option>Picape</option>
                <option>Perua/SW</option>
                <option>Utilitário</option>
                <option>Van/Minivan</option>
                <option>Conversível</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Portas</label>
              <select name="portas" value={formData.portas} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option value="2">2 portas</option>
                <option value="3">3 portas</option>
                <option value="4">4 portas</option>
                <option value="5">5 portas</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Direção</label>
              <select name="direcao" value={formData.direcao} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option>Mecânica</option>
                <option>Hidráulica</option>
                <option>Elétrica</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Ar-condicionado</label>
              <select name="ar_condicionado" value={formData.ar_condicionado} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option>Nenhum</option>
                <option>Manual</option>
                <option>Digital (1 Zona)</option>
                <option>Digital (Dual Zone)</option>
                <option>Digital (Tri Zone)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-body-sm text-tertiary mb-1">Som / Multimídia</label>
              <input name="tipo_som" value={formData.tipo_som} onChange={handleInputChange} type="text" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface" placeholder="Ex: Multimídia 9&quot; Android Auto/CarPlay, som JBL"/>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Aro das Rodas</label>
              <select name="aro_tamanho" value={formData.aro_tamanho} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                {[13,14,15,16,17,18,19,20,21,22].map(n => <option key={n} value={n}>Aro {n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Tipo de Roda</label>
              <select name="aro_tipo" value={formData.aro_tipo} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option>Aço com Calota</option>
                <option>Liga Leve Original</option>
                <option>Liga Leve Esportiva</option>
                <option>Aro Cromado</option>
              </select>
            </div>
          </div>
        </div>

        {/* BLOCO F: GARANTIA & DOCUMENTAÇÃO */}
        <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary-container">verified_user</span>
            <h3>Bloco F — Garantia & Documentação</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Tipo de Garantia</label>
              <select name="garantia_tipo" value={formData.garantia_tipo} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface">
                <option value="">Selecione...</option>
                <option>Garantia de Fábrica</option>
                <option>Garantia Rota471</option>
                <option>Garantia Estendida</option>
                <option>Sem Garantia</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-tertiary mb-1">Garantia (meses)</label>
              <input name="garantia_meses" value={formData.garantia_meses} onChange={handleInputChange} type="number" min="0" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface" placeholder="Ex: 3"/>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {TOGGLES_GARANTIA.map(({ campo, label }) => (
              <label key={campo} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 cursor-pointer hover:border-primary-container/60 transition-colors">
                <input
                  type="checkbox"
                  name={campo}
                  checked={formData[campo]}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary-container focus:ring-0"
                />
                <span className="text-body-sm text-on-surface">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* BLOCO D: OPCIONAIS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary-container">tune</span>
            <h3>Bloco D — Opcionais & Equipamentos</h3>
          </div>
          {opcionaisCatalogo.length === 0 ? (
            <p className="text-body-sm text-tertiary">Carregando catálogo de opcionais...</p>
          ) : (
            Object.entries(opcionaisPorCategoria).map(([categoria, itens]) => (
              <div key={categoria} className="space-y-2">
                <span className="text-label-badge font-label-badge text-tertiary uppercase tracking-wider">{categoria}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {itens.map((op) => (
                    <label key={op.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:border-primary-container/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={opcionais.includes(op.nome)}
                        onChange={() => handleOpcionalChange(op.nome)}
                        className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary-container focus:ring-0"
                      />
                      <span className="text-body-sm text-on-surface">{op.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* BLOCO C */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-headline-sm font-headline-sm text-on-surface">
            <span className="material-symbols-outlined text-primary-container">photo_library</span>
            <h3>Bloco C — Galeria & Fotos</h3>
          </div>

          <label className="border-2 border-dashed border-outline-variant/40 hover:border-primary-container/70 rounded-2xl p-6 text-center bg-surface-container/60 cursor-pointer block">
            <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
            </div>
            <p className="text-body-md font-medium text-on-surface mt-2">Clique aqui para selecionar fotos</p>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {images.map((img, index) => (
              <div key={index} className={`relative group rounded-xl overflow-hidden border-2 ${img.isCapa ? 'border-primary-container shadow-lg shadow-primary-container/20' : 'border-outline-variant/30'} bg-surface-container aspect-[3/4]`}>
                <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                {img.isCapa && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary-container text-[10px] font-bold text-white">CAPA</span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setCapa(index)} className="p-1.5 rounded-lg bg-surface-container text-white hover:text-primary-container">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </button>
                  <button type="button" onClick={() => removeImage(index)} className="p-1.5 rounded-lg bg-surface-container text-white hover:text-red-500">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-outline-variant/30">
          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-label-btn font-label-btn shadow-lg shadow-primary-container/30 active:scale-95 transition-all">
          {isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Veículo' : 'Publicar Veículo no Estoque')}
        </button>
        </div>
      </form>
    </section>
  );
}
