import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { mediaUrl } from '../../config';

export default function GestaoVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarVeiculos = () => {
    api.get('/api/veiculos')
      .then(data => {
        setVeiculos(data);
        setLoading(false);
      })
      .catch(err => console.error('Erro:', err));
  };

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo permanentemente? Todas as fotos e dados serão perdidos.')) return;
    try {
      await api.del(`/api/veiculos/${id}`);
      carregarVeiculos();
    } catch (err) {
      alert(err.message || 'Erro ao excluir o veículo.');
    }
  };

  if (loading) {
    return <div className="p-8 text-on-surface">Carregando estoque...</div>;
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-10 w-full">
      <section className="space-y-5" id="gestao-veiculos">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">directions_car</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Gestão de Veículos</h2>
            </div>
            <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
              Total de <strong>{veiculos.length} veículos</strong> no seu estoque.
            </p>
          </div>
          <Link 
            to="/dashboard/cadastro-veiculo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white transition-all text-label-btn font-label-btn active:scale-95 shadow-lg shadow-black/40"
          >
            <span className="material-symbols-outlined transition-transform">add_circle</span>
            <span>+ Cadastrar Veículo</span>
          </Link>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/40 text-tertiary text-label-md font-label-md uppercase tracking-wider">
                  <th className="p-4 font-semibold">Capa</th>
                  <th className="p-4 font-semibold">Veículo</th>
                  <th className="p-4 font-semibold">Placa</th>
                  <th className="p-4 font-semibold">Preço</th>
                  <th className="p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {veiculos.map(veiculo => (
                  <tr key={veiculo.id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="p-4 w-24">
                      {veiculo.capa_imagem ? (
                        <div className="w-16 h-12 rounded-lg bg-surface-container border border-outline-variant/30 overflow-hidden">
                          <img src={mediaUrl(veiculo.capa_imagem)} alt="Capa" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-tertiary">
                          <span className="material-symbols-outlined text-[20px]">no_photography</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-body-md font-bold text-on-surface">
                        {veiculo.marca} {veiculo.modelo}
                      </div>
                      <div className="text-body-sm text-tertiary">
                        {veiculo.versao} • {veiculo.ano_fabricacao}/{veiculo.ano_modelo}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-highest border border-outline-variant/40 font-mono text-sm text-on-surface-variant font-semibold">
                        {veiculo.placa}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-body-md font-bold text-primary-container">
                        R$ {Number(veiculo.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-tertiary">{veiculo.quilometragem} km</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/editar-veiculo/${veiculo.id}`)}
                          className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-primary-container hover:border-primary-container transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleExcluir(veiculo.id)}
                          className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-error hover:border-error transition-colors"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {veiculos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-tertiary">
                      Nenhum veículo encontrado no estoque.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
