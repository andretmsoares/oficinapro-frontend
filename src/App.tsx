import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Login } from "./pages/Login";
import { Veiculos } from "./pages/Veiculos";
import { OrdemDeServico } from "./pages/OrdensServico";
import { Mecanicos } from "./pages/Mecanicos";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  function handleLogin() {
    localStorage.setItem("token", "mock-token-123");
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/ordens-servico" element={<OrdemDeServico />} />
          <Route path="/mecanicos" element={<Mecanicos />} />
          <Route path="/pecas" element={<div>Peças</div>} />
          <Route path="/pagamentos" element={<div>Pagamentos</div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
