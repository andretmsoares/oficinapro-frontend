import type { Page, Route } from "@playwright/test";

/**
 * Backend simulado em memória para os testes E2E.
 *
 * O navegador, o Vite e todo o frontend são reais; só a API HTTP é substituída
 * (page.route), o que torna os testes determinísticos e independentes de banco.
 */

interface Cliente {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
  oficinaId: number;
}

interface Pagamento {
  id: number;
  osId: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  status: "PAGAMENTO_PENDENTE" | "PAGO_PARCIALMENTE" | "PAGA";
  dataPagamentoTotal: string | null;
  obs: string;
}

export const GERENTE = {
  id: 1,
  nome: "Ana Gerente",
  telefone: "83988887777",
  documento: "12345678901",
  oficinaId: 7,
  username: "ana.gerente",
  role: "GERENTE",
  bloqueado: false,
};

const ORDEM = {
  id: 1,
  oficinaId: 7,
  unidadeId: 1,
  veiculoId: 1,
  clienteId: 1,
  mecanicoId: 1,
  dataAbertura: "2026-01-15T10:00:00",
  dataFechamento: null,
  status: "ABERTA",
  obs: "Revisão geral",
  valorTotal: 50000,
  desconto: 0,
  valorComDesconto: 50000,
  placaVeiculo: "ABC1234",
  nomeCliente: "JOAO SILVA",
  unidadeNome: "UNIDADE CENTRAL",
  oficinaNome: "OFICINA TESTE",
  mecanico: "CARLOS",
};

export interface MockApi {
  clientes: Cliente[];
  pagamentos: Pagamento[];
  chamadas: string[];
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function pagina<T>(content: T[]) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    size: 20,
    number: 0,
    first: true,
    last: true,
  };
}

export async function mockApi(page: Page): Promise<MockApi> {
  const estado: MockApi = {
    clientes: [
      {
        id: 1,
        nome: "JOAO SILVA",
        documento: "12345678901",
        telefone: "83988887777",
        oficinaId: 7,
      },
    ],
    pagamentos: [
      {
        id: 10,
        osId: 1,
        valorTotal: 50000,
        valorPago: 0,
        valorPendente: 50000,
        status: "PAGAMENTO_PENDENTE",
        dataPagamentoTotal: null,
        obs: "",
      },
    ],
    chamadas: [],
  };

  await page.route("http://api.e2e/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const caminho = url.pathname.replace(/^\/api/, "");
    const metodo = request.method();
    estado.chamadas.push(`${metodo} ${caminho}`);

    const token = request.headers()["authorization"];

    if (metodo === "POST" && caminho === "/auth/login") {
      const { username, password } = request.postDataJSON();
      if (username === "ana.gerente" && password === "senha1234") {
        return json(route, {
          accessToken: "jwt-e2e",
          tokenType: "Bearer",
          expiresIn: 28800,
          usuario: GERENTE,
        });
      }
      return json(route, { message: "Credenciais inválidas" }, 401);
    }

    if (token !== "Bearer jwt-e2e") {
      return json(route, { message: "Não autenticado" }, 401);
    }

    if (caminho === "/auth/me") return json(route, GERENTE);

    if (caminho === "/dashboard/data") {
      return json(route, {
        ordensAbertas: 1,
        veiculosCadastrados: 1,
        clientesCadastrados: estado.clientes.length,
        aReceber: estado.pagamentos.reduce((s, p) => s + p.valorPendente, 0),
        pagamentosPendentes: estado.pagamentos.filter(
          (p) => p.valorPendente > 0,
        ).length,
      });
    }

    if (caminho === "/clientes/buscar")
      return json(route, pagina(estado.clientes));

    if (metodo === "POST" && caminho === "/clientes") {
      const dados = request.postDataJSON();
      const novo: Cliente = {
        id: estado.clientes.length + 1,
        oficinaId: 7,
        ...dados,
        nome: String(dados.nome).toUpperCase(),
      };
      estado.clientes.push(novo);
      return json(route, novo, 201);
    }

    if (caminho === "/ordens-servico/fluxo-mensal") return json(route, []);
    if (caminho === "/ordens-servico") return json(route, [ORDEM]);
    if (caminho === "/itens-os-peca") return json(route, []);
    if (caminho === "/pagamentos/oficina/7")
      return json(route, estado.pagamentos);

    if (caminho === "/pagamentos/oficina/7/a-receber") {
      return json(
        route,
        estado.pagamentos.reduce((s, p) => s + p.valorPendente, 0),
      );
    }

    if (caminho === "/registros-pagamento" && metodo === "POST") {
      const { pagamentoId, valor, meioPagamento } = request.postDataJSON();
      const pagamento = estado.pagamentos.find((p) => p.id === pagamentoId)!;
      pagamento.valorPago += valor;
      pagamento.valorPendente = pagamento.valorTotal - pagamento.valorPago;
      pagamento.status =
        pagamento.valorPendente === 0 ? "PAGA" : "PAGO_PARCIALMENTE";
      return json(
        route,
        {
          id: 1,
          pagamentoId,
          valor,
          meioPagamento,
          data: "2026-02-10T10:00:00",
        },
        201,
      );
    }

    return json(
      route,
      { message: `Rota não simulada: ${metodo} ${caminho}` },
      404,
    );
  });

  return estado;
}

/** Faz login pela tela, como um usuário real. */
export async function entrarComoGerente(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder("Usuário").fill("ana.gerente");
  await page.getByPlaceholder("Senha").fill("senha1234");
  await page.getByRole("button", { name: "Entrar" }).click();
}
