import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Login } from "./pages/Login";
import { Veiculos } from "./pages/Veiculos";
import { OrdensServico } from "./pages/OrdensServico";
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
import { getPagamentoStatus } from "./utils/pagamentoCalculos";
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
}: {
  allowed: Role[];
  usuarioLogado: Usuario;
}) {
  if (!allowed.includes(usuarioLogado.role)) {
    return <Navigate to={homeRouteFor(usuarioLogado.role)} replace />;
  }

  return <Outlet />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const OPERATIONAL_ROLES: Role[] = ["MECANICO", "GERENTE"];
  const GERENTE_ROLES: Role[] = ["GERENTE"];
  const ADMIN_ROLES: Role[] = ["ADMIN"];

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
          {/* Rotas operacionais */}
          <Route
            element={
              <RequireRole
                allowed={OPERATIONAL_ROLES}
                usuarioLogado={usuarioLogado}
              />
            }
          >
            <Route
              path="/dashboard"
              element={<Dashboard usuarioLogado={usuarioLogado} />}
            />

            <Route
              path="/clientes"
              element={<Clientes usuarioLogado={usuarioLogado} />}
            />

            <Route
              path="/veiculos"
              element={<Veiculos usuarioLogado={usuarioLogado} />}
            />

            <Route
              path="/ordens-servico"
              element={
                <OrdensServico
                  usuarioLogado={usuarioLogado}
                  pagamentos={pagamentos}
                  onCreatePagamento={handleCreatePagamento}
                  onUpdatePagamentoValorTotal={handleUpdatePagamentoValorTotal}
                  onAddRegistroPagamento={handleAddRegistroPagamento}
                />
              }
            />
          </Route>

          {/* Rotas exclusivas do GERENTE */}
          <Route
            element={
              <RequireRole
                allowed={GERENTE_ROLES}
                usuarioLogado={usuarioLogado}
              />
            }
          >
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
            <Route path="/mecanicos" element={<Mecanicos />} />
            <Route
              path="/usuarios"
              element={<Usuarios usuarioLogado={usuarioLogado} />}
            />

            <Route
              path="/unidades"
              element={<Unidades oficinaId={usuarioLogado.oficinaId ?? 0} />}
            />
          </Route>

          {/* Rotas exclusivas do ADMIN SaaS */}
          <Route
            element={
              <RequireRole
                allowed={ADMIN_ROLES}
                usuarioLogado={usuarioLogado}
              />
            }
          >
            <Route path="/admin/oficinas" element={<Oficinas />} />

            <Route
              path="/admin/usuarios"
              element={<Usuarios usuarioLogado={usuarioLogado} />}
            />
          </Route>

          {/* Rota inicial */}
          <Route
            path="/"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
          />

          {/* Login não deve aparecer autenticado */}
          <Route
            path="/login"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
