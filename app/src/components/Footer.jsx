import React from 'react';
import logoJ4 from '../assets/logo-j4business.png';

export default function Footer() {
  return (
    <>
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
<li className=""><a className="text-on-surface-variant hover:text-primary-container dark:hover:text-primary-container transition-colors duration-150" href="#financiamento">Simulador de Financiamento</a></li>
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
<div className="flex flex-col md:flex-row items-center gap-4">
<div className="flex items-center gap-4 text-label-badge font-label-badge text-outline uppercase tracking-wider">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Showroom Aberto</span>
<span className="">CNPJ: 00.000.000/0001-00</span>
</div>
<div className="flex flex-col items-center gap-1 ml-0 md:ml-4 mt-4 md:mt-0">
  <span className="text-[10px] text-outline font-semibold uppercase tracking-widest text-center">J4 Acelerando a sua empresa</span>
  <a href="https://j4business.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group opacity-80 hover:opacity-100 transition-opacity" style={{ animation: 'slide-x 2.5s ease-in-out infinite' }}>
    <img src={logoJ4} alt="J4Business" className="h-8 w-auto object-contain" />
    <span className="material-symbols-outlined text-outline group-hover:text-primary-container text-sm transition-colors">arrow_forward</span>
  </a>
</div>
</div>
</div>
<style dangerouslySetInnerHTML={{__html: `
  @keyframes slide-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
`}} />
</div>
</footer>
    </>
  );
}
