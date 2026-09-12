// URL base da API. Definida em app/.env (VITE_API_URL).
// Como estamos no mesmo domínio, o fallback é uma string vazia (relativo).
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Monta a URL absoluta de uma imagem servida pela API (ex.: "/uploads/veiculo-123.jpg").
export function mediaUrl(caminho) {
  if (!caminho) return '';
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${API_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
