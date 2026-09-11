import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * Protege rotas do painel.
 * - Enquanto valida o token, mostra um estado de carregamento.
 * - Sem autenticação, redireciona para /login.
 * - Com `roles`, exige que o usuário tenha um dos papéis informados.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard/veiculos" replace />;
  }

  return children;
}
