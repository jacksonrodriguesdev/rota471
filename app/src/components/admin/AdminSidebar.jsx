import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="w-72 bg-surface-container-lowest border-r border-outline-variant/20 fixed top-16 bottom-0 left-0 hidden md:flex flex-col justify-between p-4 z-40 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <span className="text-label-badge font-label-badge text-tertiary uppercase tracking-wider px-3">Navegação Principal</span>
            <nav className="mt-2 space-y-1">
              
              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/veiculos') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/veiculos">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/veiculos') ? 'text-primary-container' : 'text-tertiary'}`}>directions_car</span>
                  <span className="text-body-md font-body-md font-medium">Gestão de Veículos</span>
                </div>
              </Link>

              <Link className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/30 hover:bg-secondary-container transition-all active:scale-95 group font-label-btn text-label-btn" to="/dashboard/cadastro-veiculo">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Cadastrar Novo Veículo</span>
                </div>
              </Link>
            </nav>
          </div>

          <div>
            <span className="text-label-badge font-label-badge text-tertiary uppercase tracking-wider px-3">Sistema</span>
            <nav className="mt-2 space-y-1">
              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/marcas') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/marcas">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/marcas') ? 'text-primary-container' : 'text-tertiary'}`}>branding_watermark</span>
                  <span className="text-body-md font-body-md font-medium">Marcas & Montadoras</span>
                </div>
              </Link>
              
              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/opcionais') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/opcionais">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/opcionais') ? 'text-primary-container' : 'text-tertiary'}`}>tune</span>
                  <span className="text-body-md font-body-md font-medium">Opcionais & Equipamentos</span>
                </div>
              </Link>

              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/galeria') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/galeria">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/galeria') ? 'text-primary-container' : 'text-tertiary'}`}>photo_library</span>
                  <span className="text-body-md font-body-md font-medium">Galeria de Entregas</span>
                </div>
              </Link>

              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/aparencia') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/aparencia">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/aparencia') ? 'text-primary-container' : 'text-tertiary'}`}>wallpaper</span>
                  <span className="text-body-md font-body-md font-medium">Aparência do Site</span>
                </div>
              </Link>

              <Link className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${isActive('/dashboard/usuarios') ? 'bg-surface-container-low text-primary-container border-l-2 border-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} to="/dashboard/usuarios">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive('/dashboard/usuarios') ? 'text-primary-container' : 'text-tertiary'}`}>manage_accounts</span>
                  <span className="text-body-md font-body-md font-medium">Usuários & Acessos</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden shrink-0 uppercase font-bold text-primary-container">
              {user?.nome ? user.nome.substring(0,2) : 'AD'}
            </div>
            <div className="truncate">
              <p className="text-label-md font-label-md text-on-surface truncate">{user?.nome || 'Admin'}</p>
              <p className="text-body-sm text-tertiary truncate">{user?.email || 'admin@gmail.com'}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-xl text-error hover:bg-error/10 transition-colors shrink-0" title="Sair do sistema">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
