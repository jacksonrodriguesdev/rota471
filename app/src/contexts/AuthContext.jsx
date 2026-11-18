import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession, clearSession, getStoredUser, getToken } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Valida o token guardado contra a API ao carregar a aplicação
  useEffect(() => {
    let ativo = true;
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    // Mostra otimista enquanto valida
    setUser(getStoredUser());

    api.get('/api/auth/me')
      .then((data) => {
        if (!ativo) return;
        setUser(data.usuario);
        saveSession(token, data.usuario);
      })
      .catch(() => {
        if (!ativo) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  // Logout automático quando a API responde 401 em qualquer requisição
  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('rota471:unauthorized', onUnauthorized);
    return () => window.removeEventListener('rota471:unauthorized', onUnauthorized);
  }, [navigate]);

  const login = useCallback(async (email, senha) => {
    try {
      const data = await api.post('/api/auth/login', { email, senha }, { auth: false });
      saveSession(data.token, data.usuario);
      setUser(data.usuario);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Erro de conexão com o servidor.' };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
