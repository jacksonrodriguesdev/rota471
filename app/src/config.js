// URL base da API. Definida em app/.env (VITE_API_URL).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Monta a URL absoluta de uma imagem servida pela API (ex.: "/uploads/veiculo-123.jpg").
export function mediaUrl(caminho) {
  if (!caminho) return '';
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${API_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
