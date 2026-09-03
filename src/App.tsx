import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login"; 
import type { JSX } from "react/jsx-runtime";
import { useState } from "react";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  // Mude para true se quiser testar o Dashboard direto
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <MainLayout onLogout={() => setIsAuthenticated(false)}>
      <Dashboard />
    </MainLayout>
  );
}

export default App;