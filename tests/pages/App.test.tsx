import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { http, HttpResponse } from "msw";

import App from "../../src/App";
import { UNAUTHORIZED_EVENT } from "../../src/services/api";
import { API, adminSaas, gerente, mecanico } from "../mocks/factories";
import { server } from "../mocks/server";
import { TOKEN, handlersVazios, sessaoComo } from "../helpers/sessao";

function abrir(caminho: string) {
  window.history.pushState({}, "", caminho);
  return render(<App />);
}

const naTelaDeLogin = () =>
  screen.getByRole("heading", { name: "Seja Bem-vindo" });

describe("App - autenticação", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("sem token mostra a tela de login e não consulta o backend", async () => {
    abrir("/dashboard");

    expect(
      await screen.findByRole("heading", { name: "Seja Bem-vindo" }),
    ).toBeInTheDocument();
    // Qualquer chamada inesperada falharia: não há handlers registrados.
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("mostra 'Carregando...' enquanto valida o token salvo", async () => {
    localStorage.setItem("accessToken", TOKEN);
    let liberar: () => void = () => undefined;
    const portao = new Promise<void>((resolve) => (liberar = resolve));
    server.use(
      http.get(`${API}/auth/me`, async () => {
        await portao;
        return HttpResponse.json(gerente());
      }),
      ...handlersVazios(),
    );

    abrir("/dashboard");

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    liberar();
    expect(await screen.findByText(/Olá, Ana Gerente/)).toBeInTheDocument();
  });

  it("restaura a sessão a partir do token e envia o Bearer no /auth/me", async () => {
    localStorage.setItem("accessToken", TOKEN);
    let authorization: string | null = null;
    server.use(
      http.get(`${API}/auth/me`, ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json(gerente());
      }),
      ...handlersVazios(),
    );

    abrir("/dashboard");

    expect(await screen.findByText(/Olá, Ana Gerente/)).toBeInTheDocument();
    expect(authorization).toBe(`Bearer ${TOKEN}`);
    expect(screen.getByText("Gerente")).toBeInTheDocument();
  });

  it("token inválido/expirado: volta ao login e remove o token salvo", async () => {
    localStorage.setItem("accessToken", "expirado");
    server.use(
      http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 401 })),
    );

    abrir("/dashboard");

    await waitFor(() => naTelaDeLogin());
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("login válido salva só o accessToken e abre o sistema", async () => {
    const user = userEvent.setup();
    let corpoLogin: unknown;
    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        corpoLogin = await request.json();
        return HttpResponse.json({
          accessToken: "novo-jwt",
          tokenType: "Bearer",
          expiresIn: 28800,
          usuario: gerente(),
        });
      }),
      ...handlersVazios(),
    );
    abrir("/");
    await screen.findByRole("heading", { name: "Seja Bem-vindo" });

    await user.type(screen.getByPlaceholderText("Usuário"), "ana.gerente");
    await user.type(screen.getByPlaceholderText("Senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText(/Olá, Ana Gerente/)).toBeInTheDocument();
    expect(corpoLogin).toEqual({
      username: "ana.gerente",
      password: "senha1234",
    });
    expect(localStorage.getItem("accessToken")).toBe("novo-jwt");
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("login inválido mostra o erro, mantém o login e não grava token", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(
          { message: "Credenciais inválidas" },
          { status: 401 },
        ),
      ),
    );
    abrir("/");
    await screen.findByRole("heading", { name: "Seja Bem-vindo" });

    await user.type(screen.getByPlaceholderText("Usuário"), "ana");
    await user.type(screen.getByPlaceholderText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Usuário ou senha inválidos."),
    ).toBeInTheDocument();
    naTelaDeLogin();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("conta bloqueada mostra a mensagem do servidor no login", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ message: "Conta bloqueada." }, { status: 423 }),
      ),
    );
    abrir("/");
    await screen.findByRole("heading", { name: "Seja Bem-vindo" });

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Conta bloqueada.")).toBeInTheDocument();
  });

  it("logout pelo menu lateral apaga o token e volta ao login", async () => {
    const user = userEvent.setup();
    sessaoComo(gerente());
    abrir("/dashboard");
    await screen.findByText(/Olá, Ana Gerente/);

    await user.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() => naTelaDeLogin());
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("logout pelo menu do usuário no cabeçalho", async () => {
    const user = userEvent.setup();
    sessaoComo(gerente());
    abrir("/dashboard");
    await screen.findByText(/Olá, Ana Gerente/);

    await user.click(screen.getByRole("button", { name: /Ana Gerente/ }));
    const menu = document.querySelector(".user-menu") as HTMLElement;
    await user.click(menu.querySelector(".user-menu-item-danger")!);

    await waitFor(() => naTelaDeLogin());
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("um 401 em qualquer requisição (sessão expirada) derruba a sessão", async () => {
    sessaoComo(gerente());
    abrir("/dashboard");
    await screen.findByText(/Olá, Ana Gerente/);

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });

    await waitFor(() => naTelaDeLogin());
  });
});

describe("App - rotas e permissões por papel", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it.each([
    {
      papel: "GERENTE",
      usuario: gerente(),
      origem: "/",
      destino: "/dashboard",
    },
    {
      papel: "GERENTE",
      usuario: gerente(),
      origem: "/login",
      destino: "/dashboard",
    },
    {
      papel: "GERENTE",
      usuario: gerente(),
      origem: "/rota-inexistente",
      destino: "/dashboard",
    },
    {
      papel: "MECANICO",
      usuario: mecanico(),
      origem: "/",
      destino: "/dashboard",
    },
    {
      papel: "ADMIN",
      usuario: adminSaas(),
      origem: "/",
      destino: "/admin/oficinas",
    },
    {
      papel: "ADMIN",
      usuario: adminSaas(),
      origem: "/login",
      destino: "/admin/oficinas",
    },
  ])(
    "$papel abrindo $origem cai em $destino",
    async ({ usuario, origem, destino }) => {
      sessaoComo(usuario);

      abrir(origem);

      await waitFor(() => expect(window.location.pathname).toBe(destino));
    },
  );

  it("MECANICO não acessa rotas de GERENTE: é redirecionado ao dashboard", async () => {
    for (const rota of [
      "/pagamentos",
      "/pecas",
      "/mecanicos",
      "/usuarios",
      "/unidades",
    ]) {
      localStorage.clear();
      sessaoComo(mecanico());
      const { unmount } = abrir(rota);

      await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
      expect(
        screen.queryByRole("heading", { name: "Pagamentos" }),
      ).not.toBeInTheDocument();
      unmount();
    }
  });

  it("MECANICO acessa as rotas operacionais", async () => {
    sessaoComo(mecanico());

    abrir("/clientes");

    expect(
      await screen.findByRole("heading", { name: "Clientes" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/clientes");
  });

  it("GERENTE não acessa as rotas do ADMIN do SaaS", async () => {
    sessaoComo(gerente());

    abrir("/admin/oficinas");

    await waitFor(() => expect(window.location.pathname).toBe("/dashboard"));
  });

  it("ADMIN do SaaS não acessa as rotas da oficina", async () => {
    sessaoComo(adminSaas());

    abrir("/clientes");

    await waitFor(() =>
      expect(window.location.pathname).toBe("/admin/oficinas"),
    );
  });

  it("ADMIN do SaaS vê a administração de oficinas", async () => {
    sessaoComo(adminSaas());

    abrir("/admin/oficinas");

    expect(await screen.findByText(/Olá, Admin SaaS/)).toBeInTheDocument();
    expect(
      screen.getByText("Acompanhe e gerencie todas as oficinas do sistema."),
    ).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("GERENTE vê o resumo da oficina no dashboard", async () => {
    sessaoComo(gerente());
    server.use(
      http.get(`${API}/dashboard/data`, () =>
        HttpResponse.json({
          ordensAbertas: 4,
          veiculosCadastrados: 12,
          clientesCadastrados: 9,
          aReceber: 150050,
          pagamentosPendentes: 3,
        }),
      ),
    );

    abrir("/dashboard");

    expect(
      await screen.findByText("3 pagamentos pendentes"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ordens abertas").closest(".stat-card"),
    ).toHaveTextContent("4");
    expect(
      screen.getByText("A receber").closest(".stat-card"),
    ).toHaveTextContent(/R\$\s*1\.500,50/);
  });

  it("MECANICO não vê os cartões financeiros do dashboard", async () => {
    sessaoComo(mecanico());

    abrir("/dashboard");

    expect(await screen.findByText(/Olá, Carlos Mecanico/)).toBeInTheDocument();
    await screen.findByText("Nenhuma ordem de serviço encontrada.");
    expect(screen.queryByText("A receber")).not.toBeInTheDocument();
  });
});
