import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '', role: 'admin' });
  const { user } = useContext(AuthContext);

  const carregarUsuarios = () => {
    api.get('/api/usuarios')
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) return;

    try {
      await api.post('/api/usuarios', novoUsuario);
      setNovoUsuario({ nome: '', email: '', senha: '', role: 'admin' });
      setModalAberto(false);
      carregarUsuarios();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar usuário.');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja revogar o acesso deste usuário?')) return;
    try {
      await api.del(`/api/usuarios/${id}`);
      carregarUsuarios();
    } catch (err) {
      alert(err.message || 'Erro ao excluir usuário.');
    }
  };

  if (loading) return <div className="p-8 text-on-surface">Carregando usuários...</div>;

  return (
    <main className="flex-1 p-4 md:p-8 space-y-10 w-full">
      <section className="space-y-5" id="gestao-usuarios">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">group</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Usuários & Acessos</h2>
            </div>
            <p className="text-body-sm font-body-sm text-tertiary mt-0.5">
              Gerencie quem pode acessar o painel administrativo.
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white transition-all text-label-btn font-label-btn active:scale-95 shadow-lg shadow-black/40 group"
          >
            <span className="material-symbols-outlined transition-transform">person_add</span>
            <span>+ Novo Acesso</span>
          </button>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/40 text-tertiary text-label-md font-label-md uppercase tracking-wider">
                  <th className="p-4 font-semibold">Usuário</th>
                  <th className="p-4 font-semibold">E-mail</th>
                  <th className="p-4 font-semibold">Nível de Acesso</th>
                  <th className="p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/50 flex items-center justify-center text-primary-container font-bold uppercase">
                          {u.nome.substring(0,2)}
                        </div>
                        <div className="text-body-md font-bold text-on-surface">
                          {u.nome}
                          {user?.id === u.id && <span className="ml-2 text-[10px] bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-full">Você</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-body-sm text-tertiary">
                      {u.email}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${u.role === 'superadmin' ? 'bg-error/20 text-error border border-error/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {u.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role !== 'superadmin' && user?.id !== u.id && (
                        <button 
                          onClick={() => handleExcluir(u.id)}
                          className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center border border-outline-variant/50 hover:text-error hover:border-error transition-colors"
                          title="Revogar Acesso"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Novo Acesso */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-title-lg font-title-lg text-white">Criar Novo Acesso</h3>
              <button onClick={() => setModalAberto(false)} className="text-tertiary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Senha</label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-body-md text-white focus:border-primary-container focus:outline-none"
                  minLength={8}
                  required
                />
                <p className="text-[11px] text-tertiary mt-1">Mínimo 8 caracteres, com maiúscula, minúscula e número.</p>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg text-label-btn font-label-btn text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary-container text-white text-label-btn font-label-btn hover:bg-secondary-container transition-colors shadow-lg">
                  Criar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
