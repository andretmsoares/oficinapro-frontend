import { useEffect, useState } from "react";
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
import { Usuarios } from "./pages/Usuarios";
import { Oficinas } from "./pages/Oficinas";
import { Unidades } from "./pages/Unidades";

import type {
  MeioDePagamento,
  Pagamento,
  RegistroPagamento,
} from "./types/pagamento/pagamento";

import type { Usuario } from "./types/usuario/usuario";
import type { Role } from "./types/usuario/role";
import type { EditUsuarioFormData } from "./components/EditUsuarioModal/editUsuarioFields";

import {
  buscarUsuarioLogado,
  login as loginService,
} from "./services/auth/authService";

import { MOCK_PAGAMENTOS } from "./mocks/pagamento";
import { MOCK_REGISTROS_PAGAMENTO } from "./mocks/registroPagamento";

import { getPagamentoStatus } from "./utils/pagamentoCalculos";

function homeRouteFor(role: Role): string {
  if (role === "ADMIN") {
    return "/admin/oficinas";
  }

  return "/dashboard";
}

interface RequireRoleProps {
  allowed: Role[];
  usuarioLogado: Usuario;
}

function RequireRole({ allowed, usuarioLogado }: RequireRoleProps) {
  if (!allowed.includes(usuarioLogado.role)) {
    return <Navigate to={homeRouteFor(usuarioLogado.role)} replace />;
  }

  return <Outlet />;
}

export default function App() {
  const OPERATIONAL_ROLES: Role[] = ["MECANICO", "GERENTE"];

  const GERENTE_ROLES: Role[] = ["GERENTE"];

  const ADMIN_ROLES: Role[] = ["ADMIN"];

  /* ---------------------------------------------------------
     AUTENTICAÇÃO
     --------------------------------------------------------- */

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  /* ---------------------------------------------------------
     PAGAMENTOS
     --------------------------------------------------------- */

  const [pagamentos, setPagamentos] = useState<Pagamento[]>(MOCK_PAGAMENTOS);

  const [registros, setRegistros] = useState<RegistroPagamento[]>(
    MOCK_REGISTROS_PAGAMENTO,
  );

  /* =========================================================
     RESTAURAR SESSÃO
     ========================================================= */

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");

      /*
       * Não existe token salvo.
       * Portanto, não existe sessão para restaurar.
       */
      if (!token) {
        setUsuarioLogado(null);
        setIsAuthenticated(false);
        setLoadingAuth(false);
        return;
      }

      try {
        /*
         * Valida o JWT consultando o backend.
         */
        const usuario = await buscarUsuarioLogado(token);

        setUsuarioLogado(usuario);
        setIsAuthenticated(true);
      } catch (error) {
        /*
         * Token inválido, expirado ou sessão não mais válida.
         */
        console.error("Não foi possível restaurar a sessão:", error);

        localStorage.removeItem("accessToken");

        setUsuarioLogado(null);
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    }

    restoreSession();
  }, []);

  /* =========================================================
     LOGIN
     ========================================================= */

  async function handleLogin(username: string, password: string) {
    const response = await loginService({
      username,
      password,
    });

    /*
     * Salva somente o access token.
     */
    localStorage.setItem("accessToken", response.accessToken);

    /*
     * O backend já devolve o usuário no login,
     * então não precisamos chamar /me novamente.
     */
    setUsuarioLogado(response.usuario);
    setIsAuthenticated(true);
  }

  /* =========================================================
     LOGOUT
     ========================================================= */

  function handleLogout() {
    localStorage.removeItem("accessToken");

    setUsuarioLogado(null);
    setIsAuthenticated(false);
  }

  /* =========================================================
     PAGAMENTOS
     ========================================================= */

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
      prev.map((pagamento) => {
        if (pagamento.osId !== osId) {
          return pagamento;
        }

        return {
          ...pagamento,
          valorTotal: novoValorTotal,
          status: getPagamentoStatus(pagamento.valorPago, novoValorTotal),
        };
      }),
    );
  }

  function handleAddRegistroPagamento(
    pagamentoId: number,
    valor: number,
    formaPagamento: MeioDePagamento,
  ) {
    const novoId =
      registros.length > 0
        ? Math.max(...registros.map((registro) => registro.id)) + 1
        : 1;

    const novoRegistro: RegistroPagamento = {
      id: novoId,
      pagamentoId,
      valor,
      formaPagamento,
      dataPagamento: new Date().toISOString(),
    };

    setRegistros((prev) => [...prev, novoRegistro]);

    setPagamentos((prev) =>
      prev.map((pagamento) => {
        if (pagamento.id !== pagamentoId) {
          return pagamento;
        }

        const novoValorPago = pagamento.valorPago + valor;

        return {
          ...pagamento,
          valorPago: novoValorPago,
          status: getPagamentoStatus(novoValorPago, pagamento.valorTotal),
        };
      }),
    );
  }

  /* =========================================================
     USUÁRIO LOGADO
     ========================================================= */

  function handleUpdateUsuarioLogado(data: EditUsuarioFormData) {
    /*
     * Ainda é atualização local.
     *
     * Posteriormente:
     * PUT /api/usuarios/me
     */
    setUsuarioLogado((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        username: data.username,
      };
    });
  }

  /* =========================================================
     LOADING DA AUTENTICAÇÃO
     ========================================================= */

  if (loadingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Carregando...</p>
      </div>
    );
  }

  /* =========================================================
     LOGIN
     ========================================================= */

  /*
   * Só renderizamos o sistema quando:
   *
   * 1. existe um token válido
   * 2. conseguimos obter o usuário
   */
  if (!isAuthenticated || !usuarioLogado) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <MainLayout
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
        onUpdateUsuarioLogado={handleUpdateUsuarioLogado}
      >
        <Routes>
          {/* =================================================
              ROTAS OPERACIONAIS
              ================================================= */}

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

          {/* =================================================
              ROTAS GERENTE
              ================================================= */}

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

          {/* =================================================
              ROTAS ADMINISTRADOR SAAS
              ================================================= */}

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

          <Route
            path="/"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
          />

          <Route
            path="/login"
            element={<Navigate to={homeRouteFor(usuarioLogado.role)} replace />}
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
