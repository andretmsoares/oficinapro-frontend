import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Pagamentos } from "../../src/pages/Pagamentos";
import type { Pagamento } from "../../src/types/pagamento/pagamento";
import type { RegistroPagamento } from "../../src/types/registroPagamento/registroPagamento";
import { API, pagamento } from "../mocks/factories";
import { server } from "../mocks/server";

const pendente = pagamento();
const parcial = pagamento({
  id: 11,
  osId: 2,
  valorTotal: 120000,
  valorPago: 30000,
  valorPendente: 90000,
  status: "PAGO_PARCIALMENTE",
});
const quitado = pagamento({
  id: 12,
  osId: 3,
  valorTotal: 10000,
  valorPago: 10000,
  valorPendente: 0,
  status: "PAGA",
});

const registro = (
  overrides: Partial<RegistroPagamento> = {},
): RegistroPagamento => ({
  id: 100,
  pagamentoId: 11,
  valor: 30000,
  meioPagamento: "PIX",
  data: "2026-02-10T14:30:00",
  ...overrides,
});

/** Backend em memória: a lista e o "a receber" refletem o estado atual. */
function backend(inicial: Pagamento[] = [pendente, parcial, quitado]) {
  const estado = {
    pagamentos: inicial,
    aReceber: 140000,
    registros: [registro()],
  };
  server.use(
    http.get(`${API}/pagamentos/oficina/7`, () =>
      HttpResponse.json(estado.pagamentos),
    ),
    http.get(`${API}/pagamentos/oficina/7/a-receber`, () =>
      HttpResponse.json(estado.aReceber),
    ),
    http.get(`${API}/registros-pagamento/pagamento/:id`, () =>
      HttpResponse.json(estado.registros),
    ),
  );
  return estado;
}

const linhaDe = (osCodigo: string) =>
  within(document.querySelector<HTMLElement>(".table-card")!)
    .getByText(osCodigo)
    .closest("tr")!;
const textoDaLinha = (linha: HTMLElement) =>
  linha.textContent?.replace(/\s/g, " ") ?? "";
const cartao = (titulo: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(".stat-card")).find(
    (c) => c.querySelector(".stat-title")?.textContent === titulo,
  )!;
const meioDePagamento = () =>
  within(document.querySelector<HTMLElement>(".form-content")!).getByRole(
    "combobox",
  );

function renderizar() {
  const user = userEvent.setup();
  render(<Pagamentos oficinaId={7} />);
  return user;
}

describe("Página de Pagamentos", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("listagem e totais", () => {
    it("mostra 'Carregando...' e depois valor da OS, recebido, a receber e status de cada pagamento", async () => {
      backend();

      renderizar();

      expect(screen.getByText("Carregando...")).toBeInTheDocument();
      await screen.findByText("#0001");

      expect(textoDaLinha(linhaDe("#0001"))).toContain("R$ 500,00");
      expect(
        within(linhaDe("#0001")).getByText("Pendente"),
      ).toBeInTheDocument();

      const linhaParcial = textoDaLinha(linhaDe("#0002"));
      expect(linhaParcial).toContain("R$ 1.200,00");
      expect(linhaParcial).toContain("R$ 300,00");
      expect(linhaParcial).toContain("R$ 900,00");
      expect(within(linhaDe("#0002")).getByText("Parcial")).toBeInTheDocument();

      expect(textoDaLinha(linhaDe("#0003"))).toContain("R$ 0,00");
      expect(within(linhaDe("#0003")).getByText("Pago")).toBeInTheDocument();
    });

    it("cartões: total recebido (soma), a receber (backend), quantidade e pendentes", async () => {
      backend();

      renderizar();
      await screen.findByText("#0001");

      expect(cartao("Total Recebido")).toHaveTextContent("R$ 400,00");
      expect(cartao("A Receber")).toHaveTextContent("R$ 1.400,00");
      expect(cartao("Pagamentos")).toHaveTextContent("3");
      // pendentes = pagamentos com valor pendente > 0 (a OS quitada não conta)
      expect(cartao("Pendentes")).toHaveTextContent("2");
    });

    it("sem pagamentos mostra o estado vazio e zera os totais", async () => {
      backend([]);

      renderizar();

      expect(
        await screen.findByText("Nenhum pagamento cadastrado"),
      ).toBeInTheDocument();
      expect(cartao("Total Recebido")).toHaveTextContent("R$ 0,00");
    });

    it("erro da API mostra o aviso e nenhuma linha", async () => {
      server.use(
        http.get(
          `${API}/pagamentos/oficina/7`,
          () => new HttpResponse(null, { status: 500 }),
        ),
        http.get(`${API}/pagamentos/oficina/7/a-receber`, () =>
          HttpResponse.json(0),
        ),
      );

      renderizar();

      expect(
        await screen.findByText("Não foi possível carregar os pagamentos."),
      ).toBeInTheDocument();
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    it("erro 403 (perfil sem acesso) também é sinalizado", async () => {
      server.use(
        http.get(
          `${API}/pagamentos/oficina/7`,
          () => new HttpResponse(null, { status: 403 }),
        ),
        http.get(
          `${API}/pagamentos/oficina/7/a-receber`,
          () => new HttpResponse(null, { status: 403 }),
        ),
      );

      renderizar();

      expect(
        await screen.findByText("Não foi possível carregar os pagamentos."),
      ).toBeInTheDocument();
    });
  });

  describe("pesquisa e filtro", () => {
    it("pesquisa pelo código da OS", async () => {
      backend();
      const user = renderizar();
      await screen.findByText("#0001");

      await user.type(
        screen.getByPlaceholderText("Pesquisar pelo código da OS"),
        "3",
      );

      expect(screen.getByText("#0003")).toBeInTheDocument();
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();
      expect(screen.queryByText("#0002")).not.toBeInTheDocument();
    });

    it("filtra por status e mostra mensagem quando nada corresponde", async () => {
      backend([pendente, quitado]);
      const user = renderizar();
      await screen.findByText("#0001");
      const filtro = screen.getByRole("combobox", {
        name: "Filtrar por status",
      });

      await user.selectOptions(filtro, "PAGA");
      expect(screen.getByText("#0003")).toBeInTheDocument();
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();

      await user.selectOptions(filtro, "PAGO_PARCIALMENTE");
      expect(
        screen.getByText(
          "Nenhum pagamento encontrado para o filtro selecionado",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("registrar pagamento", () => {
    async function abrirRegistro(os: string) {
      const user = renderizar();
      await screen.findByText(os);
      await user.click(within(linhaDe(os)).getByTitle("Registrar Pagamento"));
      return user;
    }

    it("abre o modal com o título da OS", async () => {
      backend();

      await abrirRegistro("#0001");

      expect(
        screen.getByRole("heading", { name: "Registrar Pagamento - OS #0001" }),
      ).toBeInTheDocument();
    });

    it("valor e meio de pagamento são obrigatórios", async () => {
      const estado = backend();
      let posts = 0;
      server.use(
        http.post(`${API}/registros-pagamento`, () => {
          posts++;
          return HttpResponse.json(registro(), { status: 201 });
        }),
      );
      const user = await abrirRegistro("#0001");

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(screen.getByText("Valor Pago é obrigatório")).toBeInTheDocument();
      expect(
        screen.getByText("Meio de Pagamento é obrigatório"),
      ).toBeInTheDocument();
      expect(posts).toBe(0);
      expect(estado.pagamentos[0].valorPago).toBe(0);
    });

    it("não aceita valor acima do saldo restante da OS", async () => {
      backend();
      let posts = 0;
      server.use(
        http.post(`${API}/registros-pagamento`, () => {
          posts++;
          return HttpResponse.json(registro(), { status: 201 });
        }),
      );
      const user = await abrirRegistro("#0002");

      // saldo restante da OS #0002 = R$ 900,00; tenta pagar R$ 900,01
      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "90001",
      );
      await user.selectOptions(meioDePagamento(), "PIX");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        screen.getByText(/Valor máximo permitido: R\$\s*900,00/),
      ).toBeInTheDocument();
      expect(posts).toBe(0);
    });

    it("aceita exatamente o saldo restante (pagamento total)", async () => {
      const estado = backend();
      let corpo: unknown;
      server.use(
        http.post(`${API}/registros-pagamento`, async ({ request }) => {
          corpo = await request.json();
          estado.pagamentos = estado.pagamentos.map((p) =>
            p.id === 11
              ? {
                  ...p,
                  valorPago: 120000,
                  valorPendente: 0,
                  status: "PAGA" as const,
                }
              : p,
          );
          estado.aReceber = 50000;
          return HttpResponse.json(registro({ valor: 90000 }), { status: 201 });
        }),
      );
      const user = await abrirRegistro("#0002");

      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "90000",
      );
      await user.selectOptions(meioDePagamento(), "DINHEIRO");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() =>
        expect(within(linhaDe("#0002")).getByText("Pago")).toBeInTheDocument(),
      );
      expect(corpo).toEqual({
        pagamentoId: 11,
        valor: 90000,
        meioPagamento: "DINHEIRO",
      });
      expect(cartao("A Receber")).toHaveTextContent("R$ 500,00");
      expect(cartao("Pendentes")).toHaveTextContent("1");
    });

    it("pagamento parcial atualiza status, valores e fecha o modal", async () => {
      const estado = backend();
      let corpo: unknown;
      server.use(
        http.post(`${API}/registros-pagamento`, async ({ request }) => {
          corpo = await request.json();
          estado.pagamentos = estado.pagamentos.map((p) =>
            p.id === 10
              ? {
                  ...p,
                  valorPago: 20000,
                  valorPendente: 30000,
                  status: "PAGO_PARCIALMENTE" as const,
                }
              : p,
          );
          estado.aReceber = 120000;
          return HttpResponse.json(
            registro({ pagamentoId: 10, valor: 20000 }),
            { status: 201 },
          );
        }),
      );
      const user = await abrirRegistro("#0001");

      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "20000",
      );
      await user.selectOptions(meioDePagamento(), "PIX");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() =>
        expect(
          within(linhaDe("#0001")).getByText("Parcial"),
        ).toBeInTheDocument(),
      );
      expect(corpo).toEqual({
        pagamentoId: 10,
        valor: 20000,
        meioPagamento: "PIX",
      });
      const linha = textoDaLinha(linhaDe("#0001"));
      expect(linha).toContain("R$ 200,00");
      expect(linha).toContain("R$ 300,00");
      expect(cartao("A Receber")).toHaveTextContent("R$ 1.200,00");
      expect(
        screen.queryByRole("heading", { name: /Registrar Pagamento/ }),
      ).not.toBeInTheDocument();
    });

    it("erro do backend aparece no modal, que permanece aberto, e os valores não mudam", async () => {
      backend();
      server.use(
        http.post(`${API}/registros-pagamento`, () =>
          HttpResponse.json(
            { message: "Valor do pagamento excede o valor da OS" },
            { status: 409 },
          ),
        ),
      );
      const user = await abrirRegistro("#0001");

      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "10000",
      );
      await user.selectOptions(meioDePagamento(), "PIX");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Valor do pagamento excede o valor da OS"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Registrar Pagamento - OS #0001" }),
      ).toBeInTheDocument();
      expect(
        within(linhaDe("#0001")).getByText("Pendente"),
      ).toBeInTheDocument();
    });

    it("Fechar descarta o registro", async () => {
      backend();
      const user = await abrirRegistro("#0001");

      await user.click(screen.getByRole("button", { name: "Fechar" }));

      expect(
        screen.queryByRole("heading", { name: /Registrar Pagamento/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("visualizar pagamento", () => {
    async function abrirDetalhes(os: string) {
      const user = renderizar();
      await screen.findByText(os);
      await user.click(within(linhaDe(os)).getByTitle("Visualizar pagamento"));
      return user;
    }

    it("mostra resumo (valor da OS, recebido, restante) e o histórico de registros", async () => {
      backend();

      await abrirDetalhes("#0002");

      const modal = document.querySelector<HTMLElement>(".payment-modal")!;
      await within(modal).findByText("PIX");
      const texto = modal.textContent!.replace(/\s/g, " ");
      expect(texto).toContain("R$ 1.200,00");
      expect(texto).toContain("R$ 300,00");
      expect(texto).toContain("R$ 900,00");
      expect(within(modal).getByText("#0011")).toBeInTheDocument();
    });

    it("pagamento sem registros mostra mensagem de histórico vazio", async () => {
      const estado = backend();
      estado.registros = [];

      await abrirDetalhes("#0001");

      expect(
        await screen.findByText("Nenhum pagamento registrado."),
      ).toBeInTheDocument();
    });

    it("remover um registro pede confirmação, chama DELETE e recarrega os valores", async () => {
      const estado = backend();
      const removidos: string[] = [];
      server.use(
        http.delete(`${API}/registros-pagamento/:id`, ({ params }) => {
          removidos.push(String(params.id));
          estado.registros = [];
          estado.pagamentos = estado.pagamentos.map((p) =>
            p.id === 11
              ? {
                  ...p,
                  valorPago: 0,
                  valorPendente: 120000,
                  status: "PAGAMENTO_PENDENTE" as const,
                }
              : p,
          );
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = await abrirDetalhes("#0002");
      await screen.findByText("PIX");

      await user.click(
        screen.getByRole("button", { name: "Remover pagamento" }),
      );
      expect(
        screen.getByRole("heading", { name: "Remover pagamento" }),
      ).toBeInTheDocument();
      expect(removidos).toEqual([]);
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() => expect(removidos).toEqual(["100"]));
      expect(
        await screen.findByText("Nenhum pagamento registrado."),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(
          within(linhaDe("#0002")).getByText("Pendente"),
        ).toBeInTheDocument(),
      );
    });

    it("Fechar esconde o modal de detalhes", async () => {
      backend();
      const user = await abrirDetalhes("#0002");
      await screen.findByText("PIX");

      await user.click(screen.getByRole("button", { name: "Fechar" }));

      expect(document.querySelector(".payment-modal")).toBeNull();
    });

    it("histórico com erro de carregamento não quebra o modal", async () => {
      backend();
      server.use(
        http.get(
          `${API}/registros-pagamento/pagamento/:id`,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      await abrirDetalhes("#0002");

      expect(
        await screen.findByText("Nenhum pagamento registrado."),
      ).toBeInTheDocument();
    });
  });

  describe("comprovante", () => {
    it("baixa o comprovante da OS do pagamento", async () => {
      backend();
      server.use(
        http.get(
          `${API}/ordens-servico/2/comprovante-pagamento`,
          () =>
            new HttpResponse(new Blob(["%PDF"]), {
              headers: { "Content-Type": "application/pdf" },
            }),
        ),
      );
      Object.defineProperty(URL, "createObjectURL", {
        value: vi.fn(() => "blob:comprovante"),
        configurable: true,
        writable: true,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
      const baixados: string[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        function (this: HTMLAnchorElement) {
          baixados.push(this.download);
        },
      );
      const user = renderizar();
      await screen.findByText("#0002");

      await user.click(
        within(linhaDe("#0002")).getByTitle(
          "Imprimir comprovante de pagamento",
        ),
      );

      await waitFor(() =>
        expect(baixados).toEqual(["comprovante-pagamento-os-2.pdf"]),
      );
    });
  });
});
