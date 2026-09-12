// URL base da API. Definida em app/.env (VITE_API_URL).
// Como estamos no mesmo domínio, o fallback é uma string vazia (relativo).
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Monta a URL absoluta de uma imagem servida pela API (ex.: "/uploads/veiculo-123.jpg").
export function mediaUrl(caminho) {
  if (!caminho) return '';
  if (caminho.startsWith('http')) return caminho;
  
  // Extrai apenas o nome do arquivo final (ex: veiculo-123.jpg)
  const fileName = caminho.split('/').pop();
  
  // Usa a nova rota de mídia dinâmica que dribla o Nginx e acessa o armazenamento persistente
  return `${API_URL}/api/media?file=${fileName}`;
}
