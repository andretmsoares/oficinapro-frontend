import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Login } from "./pages/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  function handleLogin() {
    localStorage.setItem("token", "mock-token-123");
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <MainLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/veiculos" element={<div>Veículos</div>} />
          <Route path="/ordens-servico" element={<div>Ordens de Serviço</div>} />
          <Route path="/mecanicos" element={<div>Mecânicos</div>} />
          <Route path="/pecas" element={<div>Peças</div>} />
          <Route path="/distribuidoras" element={<div>Distribuidoras</div>} />
          <Route path="/pagamentos" element={<div>Pagamentos</div>} />
          <Route path="/relatorios" element={<div>Relatórios</div>} />
          <Route path="/configuracoes" element={<div>Configurações</div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}