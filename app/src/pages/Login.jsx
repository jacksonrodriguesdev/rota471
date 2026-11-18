import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, senha);
    if (!res.success) {
      setError(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container/50 via-background to-background relative overflow-hidden">
      
      {/* Elementos decorativos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-error/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-2xl relative z-10 mx-4">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-inner mb-4">
            <span className="material-symbols-outlined text-3xl text-primary-container">admin_panel_settings</span>
          </div>
          <h1 className="text-display-sm font-display-sm text-on-surface tracking-tight mb-2">
            Rota471 Admin
          </h1>
          <p className="text-body-md font-body-md text-tertiary">
            Entre com suas credenciais para acessar o painel de gestão.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3 text-error">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span className="text-body-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-label-md font-label-md text-on-surface-variant ml-1">E-mail de Acesso</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary material-symbols-outlined text-[20px]">mail</span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="admin@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-label-md font-label-md text-on-surface-variant">Senha</label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary material-symbols-outlined text-[20px]">lock</span>
              <input 
                type="password" 
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-label-btn font-label-btn shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/')} className="text-body-sm font-body-sm text-tertiary hover:text-on-surface transition-colors flex items-center justify-center gap-1.5 mx-auto">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Voltar para o site
          </button>
        </div>

      </div>
    </div>
  );
}
