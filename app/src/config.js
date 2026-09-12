// URL base da API. Definida em app/.env (VITE_API_URL).
// Como estamos no mesmo domínio, o fallback é uma string vazia (relativo).
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Monta a URL absoluta de uma imagem servida pela API (ex.: "/uploads/veiculo-123.jpg").
export function mediaUrl(caminho) {
  if (!caminho) return '';
  if (caminho.startsWith('http')) return caminho;
  
  // Na Hostinger, as imagens ficam fisicamente em /api/uploads/
  // Reescrevemos o caminho antigo para garantir que o Nginx encontre os arquivos estáticos.
  if (caminho.startsWith('/uploads/')) {
    caminho = '/api' + caminho;
  }
  
  return `${API_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
