import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DashboardLayout from './components/admin/DashboardLayout';
import DetalhesVeiculo from './pages/DetalhesVeiculo';
import CadastroVeiculo from './pages/admin/CadastroVeiculo';
import MarcasMontadoras from './pages/admin/MarcasMontadoras';
import OpcionaisEquipamentos from './pages/admin/OpcionaisEquipamentos';
import GestaoVeiculos from './pages/admin/GestaoVeiculos';
import GestaoUsuarios from './pages/admin/GestaoUsuarios';
import GaleriaEntregas from './pages/admin/GaleriaEntregas';
import AparenciaSite from './pages/admin/AparenciaSite';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/veiculo/:id" element={<DetalhesVeiculo />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas do Dashboard - Protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="veiculos" replace />} />
            <Route path="cadastro-veiculo" element={<CadastroVeiculo />} />
            <Route path="editar-veiculo/:id" element={<CadastroVeiculo />} />
            <Route path="veiculos" element={<GestaoVeiculos />} />
            <Route path="marcas" element={<MarcasMontadoras />} />
            <Route path="opcionais" element={<OpcionaisEquipamentos />} />
            <Route path="galeria" element={<GaleriaEntregas />} />
            <Route path="aparencia" element={<AparenciaSite />} />
            <Route path="usuarios" element={<GestaoUsuarios />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
