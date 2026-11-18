import React from 'react';

export default function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 w-full border-b border-outline-variant/20 bg-surface-container-lowest/90 dark:bg-surface-container-lowest/90 backdrop-blur-md shadow-2xl shadow-black/80">
<div className="flex items-center gap-8">
{/* Brand Logo */}
<a className="flex items-center gap-2" href="#"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMuypFnljzMn89KQ5kPYzOyibbATjduEZD9TPHihUKOd9QlUJtL_sUz3uilmfbyEtTrHrjOXr7KZw91DGSMB6ci963BW6-ZuWSA6TB8CFnixEMUplt1fgcvSHLq13pAXQgjKvzqMWkbWiPjJT7VBnt86M7vvwvRAq7Y6lUJi3PNDHb6d5_Sg7hI0DidCw1X8oU432CVzw9P8fW8jHsoidg3e9bfopbb8ekJLKmgiHAepmWakEQEWTeJ3nhQSCslYT5XJ8" alt="Rota471 Veículos" className="h-10 w-auto object-contain" /></a>
{/* Desktop Nav Links */}
<nav className="hidden lg:flex items-center gap-6">
<a className="text-primary-container dark:text-primary-container border-b-2 border-primary-container font-bold pb-1 text-label-btn font-label-btn" href="#inicio">Início</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#estoque">Estoque</a>
<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#financiamento">Financiamento</a>

<a className="text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface transition-colors text-label-btn font-label-btn" href="#sobre">Sobre Nós</a>
</nav>
</div>
{/* Actions */}
<div className="flex items-center gap-3">
{/* Instagram Handle Shortcut */}
<a className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-btn font-label-btn transition-colors border border-outline-variant/30" href="https://instagram.com/rota471" target="_blank">
<span className="material-symbols-outlined text-primary-container text-lg" data-icon="photo_camera">photo_camera</span>
<span className="text-body-sm font-body-sm text-on-surface">@rota471</span>
</a>

{/* WhatsApp CTA Button */}
<a className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-white font-label-btn text-label-btn shadow-lg shadow-primary-container/30 transition-all duration-200 active:scale-95" href="https://wa.me/5553999262342" target="_blank">
<span className="material-symbols-outlined text-lg" data-icon="chat">chat</span>
<span className="">WhatsApp</span>
</a>
</div>
</header>
    </>
  );
}
