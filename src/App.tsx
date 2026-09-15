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
import type { Usuario } from "./types/usuario/usuario";
import { MOCK_PAGAMENTOS } from "./mocks/pagamento";
import { MOCK_REGISTROS_PAGAMENTO } from "./mocks/registroPagamento";
import { MOCK_USUARIO_LOGADO } from "./mocks/usuarioLogado";
import { getPagamentoStatus } from "./services/pagamentoCalculos";
import { Usuarios } from "./pages/Usuarios";
import { Oficinas } from "./pages/Oficinas";
import type { Role } from "./types/usuario/role";
import type { EditUsuarioFormData } from "./components/EditUsuarioModal/editUsuarioFields";
import { Unidades } from "./pages/Unidades";

function homeRouteFor(role: Role): string {
  return role === "ADMIN" ? "/admin/oficinas" : "/dashboard";
}

function RequireRole({
  allowed,
  usuarioLogado,
  children,
}: {
  allowed: Role[];
  usuarioLogado: Usuario;
  children: React.ReactElement;
}) {
  if (!allowed.includes(usuarioLogado.role)) {
    return <Navigate to={homeRouteFor(usuarioLogado.role)} replace />;
  }
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  // TODO: substituir pelo usuário real retornado no login.
  const [usuarioLogado, setUsuarioLogado] =
    useState<Usuario>(MOCK_USUARIO_LOGADO);

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
      pagamentos.length > 0 ? Math.max(...pagamentos.map((p) => p.id)) + 1 : 1;
    setPagamentos((prev) => [
      ...prev,
      {
        id: novoId,
        osId,
        valorTotal,
        valorPago: 0,
        status: "PENDENTE",
        obs: "",
      },
    ]);
  }

  function handleUpdatePagamentoValorTotal(
    osId: number,
    novoValorTotal: number,
  ) {
    setPagamentos((prev) =>
      prev.map((p) =>
        p.osId === osId
          ? {
              ...p,
              valorTotal: novoValorTotal,
              status: getPagamentoStatus(p.valorPago, novoValorTotal),
            }
          : p,
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
      prev.map((p) => {
        if (p.id !== pagamentoId) return p;
        const novoValorPago = p.valorPago + valor;
        return {
          ...p,
          valorPago: novoValorPago,
          status: getPagamentoStatus(novoValorPago, p.valorTotal),
        };
      }),
    );
  }

  function handleUpdateUsuarioLogado(data: EditUsuarioFormData) {
    // TODO: substituir por chamada real ao backend (PUT /usuarios/me),
    // incluindo hash de senha quando novaSenha vier preenchida.
    setUsuarioLogado((prev) => ({
      ...prev,
      nome: data.nome,
      documento: data.documento,
      telefone: data.telefone,
      username: data.username,
    }));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  return (
    <BrowserRouter>
      <MainLayout
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
        onUpdateUsuarioLogado={handleUpdateUsuarioLogado}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/clientes"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Clientes />
              </RequireRole>
            }
          />
          <Route
            path="/veiculos"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Veiculos />
              </RequireRole>
            }
          />
          <Route
            path="/ordens-servico"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <OrdemDeServico
                  pagamentos={pagamentos}
                  onCreatePagamento={handleCreatePagamento}
                  onUpdatePagamentoValorTotal={handleUpdatePagamentoValorTotal}
                  onAddRegistroPagamento={handleAddRegistroPagamento}
                />
              </RequireRole>
            }
          />
          <Route
            path="/mecanicos"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Mecanicos />
              </RequireRole>
            }
          />
          <Route
            path="/pecas"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Pecas />
              </RequireRole>
            }
          />
          <Route
            path="/pagamentos"
            element={
              <RequireRole
                allowed={["MECANICO", "GERENTE"]}
                usuarioLogado={usuarioLogado}
              >
                <Pagamentos
                  pagamentos={pagamentos}
                  registros={registros}
                  onAddRegistroPagamento={handleAddRegistroPagamento}
                />
              </RequireRole>
            }
          />

          {/* Seção exclusiva da oficina (Admin da própria oficina) */}
          <Route
            path="/usuarios"
            element={
              <RequireRole allowed={["GERENTE"]} usuarioLogado={usuarioLogado}>
                <Usuarios usuarioLogado={usuarioLogado} />
              </RequireRole>
            }
          />

          <Route
            path="/unidades"
            element={
              <RequireRole allowed={["GERENTE"]} usuarioLogado={usuarioLogado}>
                <Unidades oficinaId={usuarioLogado.oficinaId ?? 0} />
              </RequireRole>
            }
          />

          {/* Seção exclusiva do Admin SaaS */}
          <Route
            path="/admin/oficinas"
            element={
              <RequireRole allowed={["ADMIN"]} usuarioLogado={usuarioLogado}>
                {/* TODO: página de gerenciamento das oficinas do SaaS */}
                <Oficinas />
              </RequireRole>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RequireRole allowed={["ADMIN"]} usuarioLogado={usuarioLogado}>
                <Usuarios usuarioLogado={usuarioLogado} />
              </RequireRole>
            }
          />

          <Route
            path="*"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
