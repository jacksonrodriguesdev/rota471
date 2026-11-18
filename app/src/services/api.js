import { API_URL } from '../config';

export const TOKEN_KEY = '@Rota471:token';
export const USER_KEY = '@Rota471:user';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage indisponível */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* noop */
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Requisição central para a API.
 * - Injeta o header Authorization quando há token.
 * - Em 401, limpa a sessão e emite o evento "rota471:unauthorized".
 * - Lança ApiError com a mensagem vinda do backend quando a resposta não é ok.
 */
async function request(path, { method = 'GET', body, headers = {}, auth = true, isForm = false } = {}) {
  const opts = { method, headers: { ...headers } };

  if (auth) {
    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && body !== null) {
    if (isForm) {
      opts.body = body; // FormData — o browser define o Content-Type com boundary
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, opts);
  } catch {
    throw new ApiError('Erro de conexão com o servidor.', 0);
  }

  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('rota471:unauthorized'));
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Ocorreu um erro na requisição.', res.status);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  // Envio de FormData (upload de imagens)
  upload: (path, formData, method = 'POST') =>
    request(path, { method, body: formData, isForm: true }),
};
