import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import logoRota471 from '../../assets/logo.png';

export default function AdminHeader() {
  const { user } = useContext(AuthContext);

  // Helper para pegar iniciais do nome
  const getInitials = (nome) => {
    if (!nome) return 'AD';
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 w-full border-b border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md shadow-2xl shadow-black/80">
        <div className="flex items-center gap-6">
          <a className="flex items-center gap-3" href="#">
            <img alt="Rota471 Veículos" className="h-9 w-auto object-contain" src={logoRota471} />
          </a>
        </div>
        
        {/* Actions & User Profile */}
        <div className="flex items-center gap-3">
          <a className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary-container/60 bg-surface-container-low text-on-surface hover:text-primary-container transition-all text-label-btn font-label-btn active:scale-95" href="#">
            <span className="material-symbols-outlined text-[18px]">public</span>
            <span>Ver Vitrine Online</span>
          </a>
          
          <div className="h-6 w-px bg-outline-variant/30 ml-2"></div>
          
          {/* Owner Profile */}
          <div className="flex items-center gap-3 pl-1">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-primary-container/40 p-0.5 flex items-center justify-center font-headline-sm font-headline-sm text-primary-container bg-gradient-to-tr from-surface-container-high to-surface-variant uppercase font-bold">
              {getInitials(user?.nome)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-label-btn font-label-btn text-on-surface leading-tight truncate max-w-[150px]">
                {user?.nome || 'Administrador'}
              </div>
              <div className="text-body-sm font-body-sm text-tertiary">
                {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
