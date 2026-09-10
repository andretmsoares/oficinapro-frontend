import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Login } from "./pages/Login";
import { Veiculos } from "./pages/Veiculos";
import { OrdemDeServico } from "./pages/OrdensServico";
import { Mecanicos } from "./pages/Mecanicos";
import { Pecas } from "./pages/Pecas";
import { Pagamentos } from "./pages/Pagamentos";
import type {
  MeioDePagamento,
  Pagamento,
  RegistroPagamento,
} from "./types/pagamento/pagamento";
import { MOCK_PAGAMENTOS } from "./mocks/pagamento";
import { MOCK_REGISTROS_PAGAMENTO } from "./mocks/registroPagamento";
import { getPagamentoStatus } from "./services/pagamentoCalculos";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const [pagamentos, setPagamentos] = useState<Pagamento[]>(MOCK_PAGAMENTOS);
  const [registros, setRegistros] = useState<RegistroPagamento[]>(
    MOCK_REGISTROS_PAGAMENTO,
  );

  function handleLogin() {
    localStorage.setItem("token", "mock-token-123");
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  function handleCreatePagamento(osId: number, valorTotal: number) {
    const novoId =
      pagamentos.length > 0
        ? Math.max(...pagamentos.map((pagamento) => pagamento.id)) + 1
        : 1;

    const novoPagamento: Pagamento = {
      id: novoId,
      osId,
      valorTotal,
      valorPago: 0,
      status: "PENDENTE",
      obs: "",
    };

    setPagamentos((prev) => [...prev, novoPagamento]);
  }

  function handleUpdatePagamentoValorTotal(
    osId: number,
    novoValorTotal: number,
  ) {
    setPagamentos((prev) =>
      prev.map((pagamento) =>
        pagamento.osId === osId
          ? {
              ...pagamento,
              valorTotal: novoValorTotal,
              status: getPagamentoStatus(pagamento.valorPago, novoValorTotal),
            }
          : pagamento,
      ),
    );
  }

  function handleAddRegistroPagamento(
    pagamentoId: number,
    valor: number,
    formaPagamento: MeioDePagamento,
  ) {
    const novoRegistro: RegistroPagamento = {
      id:
        registros.length > 0 ? Math.max(...registros.map((r) => r.id)) + 1 : 1,
      pagamentoId,
      valor,
      formaPagamento,
      dataPagamento: new Date().toISOString(),
    };

    setRegistros((prev) => [...prev, novoRegistro]);

    setPagamentos((prev) =>
      prev.map((pagamento) => {
        if (pagamento.id !== pagamentoId) return pagamento;

        const novoValorPago = pagamento.valorPago + valor;

        return {
          ...pagamento,
          valorPago: novoValorPago,
          status: getPagamentoStatus(novoValorPago, pagamento.valorTotal),
        };
      }),
    );
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route
            path="/ordens-servico"
            element={
              <OrdemDeServico
                pagamentos={pagamentos}
                onCreatePagamento={handleCreatePagamento}
                onUpdatePagamentoValorTotal={handleUpdatePagamentoValorTotal}
                onAddRegistroPagamento={handleAddRegistroPagamento}
              />
            }
          />
          <Route path="/mecanicos" element={<Mecanicos />} />
          <Route path="/pecas" element={<Pecas />} />
          <Route
            path="/pagamentos"
            element={
              <Pagamentos
                pagamentos={pagamentos}
                registros={registros}
                onAddRegistroPagamento={handleAddRegistroPagamento}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
