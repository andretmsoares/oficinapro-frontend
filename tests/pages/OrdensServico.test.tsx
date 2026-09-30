import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { OrdensServico } from "../../src/pages/OrdensServico";
import {
  API,
  gerente,
  mecanico,
  ordemDeServico,
  pagamento,
} from "../mocks/factories";
import { server } from "../mocks/server";
import { renderComRota } from "../helpers/render";

const os1 = ordemDeServico();
const os2 = ordemDeServico({
  id: 2,
  status: "FINALIZADA",
  placaVeiculo: "XYZ9876",
  nomeCliente: "MARIA SOUZA",
  valorTotal: 120000,
  valorComDesconto: 120000,
});

function carregarDados(
  ordens = [os1, os2],
  pagamentos = [
    pagamento({ osId: 1, valorPendente: 50000 }),
    pagamento({
      id: 11,
      osId: 2,
      valorTotal: 120000,
      valorPago: 120000,
      valorPendente: 0,
      status: "PAGA",
    }),
  ],
) {
  server.use(
    http.get(`${API}/ordens-servico`, () => HttpResponse.json(ordens)),
    http.get(`${API}/itens-os-peca`, () => HttpResponse.json([])),
    http.get(`${API}/pagamentos/oficina/7`, () =>
      HttpResponse.json(pagamentos),
    ),
  );
}

const linhaDe = (texto: string) => screen.getByText(texto).closest("tr")!;

async function renderizar(usuario = gerente(), rota = "/ordens-servico") {
  const user = userEvent.setup();
  renderComRota(<OrdensServico usuarioLogado={usuario} />, rota);
  return user;
}

describe("Página de Ordens de Serviço", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("listagem", () => {
    it("mostra 'Carregando...' e depois as OS com código, placa, cliente, status e valores", async () => {
      carregarDados();

      await renderizar();

      expect(screen.getByText("Carregando...")).toBeInTheDocument();
      expect(await screen.findByText("#0001")).toBeInTheDocument();

      const linha = linhaDe("#0001");
      expect(within(linha).getByText("ABC-1234")).toBeInTheDocument();
      expect(within(linha).getByText("JOAO SILVA")).toBeInTheDocument();
      expect(within(linha).getByText("Aberta")).toBeInTheDocument();
      // valor total e valor pendente (vindo do backend) da mesma OS
      expect(linha.textContent?.replace(/\s/g, " ")).toContain("R$ 500,00");
      expect(
        within(linhaDe("#0002")).getByText("Finalizada"),
      ).toBeInTheDocument();
    });

    it("valor pendente vem do pagamento do backend; OS quitada mostra R$ 0,00", async () => {
      carregarDados();

      await renderizar();
      await screen.findByText("#0002");

      const celulas = (linha: HTMLElement) =>
        within(linha)
          .getAllByRole("cell")
          .map((c) => c.textContent?.replace(/\s/g, " "));
      expect(celulas(linhaDe("#0001"))).toContain("R$ 500,00");
      expect(celulas(linhaDe("#0002"))).toEqual(
        expect.arrayContaining(["R$ 1.200,00", "R$ 0,00"]),
      );
    });

    it("valor pendente negativo (desconto maior que o pago) é exibido como zero", async () => {
      carregarDados([os1], [pagamento({ osId: 1, valorPendente: -2500 })]);

      await renderizar();
      await screen.findByText("#0001");

      const celulas = within(linhaDe("#0001"))
        .getAllByRole("cell")
        .map((c) => c.textContent?.replace(/\s/g, " "));
      expect(celulas).toContain("R$ 0,00");
    });

    it("OS sem pagamento correspondente mostra '—' no valor pendente", async () => {
      carregarDados([os1], []);

      await renderizar();
      await screen.findByText("#0001");

      expect(within(linhaDe("#0001")).getByText("—")).toBeInTheDocument();
    });

    it("cartão mostra o total de OS", async () => {
      carregarDados();

      await renderizar();
      await screen.findByText("#0001");

      expect(
        screen.getByText("Total na base de dados").closest(".stat-card"),
      ).toHaveTextContent("2");
    });

    it("sem OS mostra o estado vazio", async () => {
      carregarDados([], []);

      await renderizar();

      expect(
        await screen.findByText("Nenhuma ordem de serviço cadastrada"),
      ).toBeInTheDocument();
    });

    it("erro da API na listagem: deixa de carregar e mostra o estado vazio", async () => {
      server.use(
        http.get(
          `${API}/ordens-servico`,
          () => new HttpResponse(null, { status: 500 }),
        ),
        http.get(`${API}/itens-os-peca`, () => HttpResponse.json([])),
        http.get(`${API}/pagamentos/oficina/7`, () => HttpResponse.json([])),
      );

      await renderizar();

      expect(
        await screen.findByText("Nenhuma ordem de serviço cadastrada"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    it("usuário sem oficina (oficinaId nulo) não consulta pagamentos", async () => {
      let consultouPagamentos = false;
      server.use(
        http.get(`${API}/ordens-servico`, () => HttpResponse.json([os1])),
        http.get(`${API}/itens-os-peca`, () => HttpResponse.json([])),
        http.get(`${API}/pagamentos/oficina/:id`, () => {
          consultouPagamentos = true;
          return HttpResponse.json([]);
        }),
      );

      await renderizar(gerente({ oficinaId: null }));
      await screen.findByText("#0001");

      expect(consultouPagamentos).toBe(false);
    });
  });

  describe("pesquisa e filtros", () => {
    it("pesquisa localmente por placa, cliente ou status", async () => {
      carregarDados();
      const user = await renderizar();
      await screen.findByText("#0001");
      const busca = screen.getByPlaceholderText(
        "Pesquisar por veículo, cliente ou status",
      );

      await user.type(busca, "maria");
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();
      expect(screen.getByText("#0002")).toBeInTheDocument();

      await user.clear(busca);
      await user.type(busca, "xyz");
      expect(screen.getByText("#0002")).toBeInTheDocument();
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();
    });

    it("pesquisa sem resultado mostra o termo", async () => {
      carregarDados();
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.type(
        screen.getByPlaceholderText(/Pesquisar por veículo/),
        "zzz",
      );

      expect(
        screen.getByText('Nenhum resultado encontrado para "zzz"'),
      ).toBeInTheDocument();
    });

    it("filtra por status e mostra mensagem própria quando nenhuma OS tem o status", async () => {
      carregarDados();
      const user = await renderizar();
      await screen.findByText("#0001");
      const filtro = screen.getByRole("combobox", {
        name: "Filtrar por status",
      });

      await user.selectOptions(filtro, "FINALIZADA");
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();
      expect(screen.getByText("#0002")).toBeInTheDocument();

      await user.selectOptions(filtro, "CANCELADA");
      expect(
        screen.getByText("Nenhuma ordem de serviço com este status"),
      ).toBeInTheDocument();

      await user.selectOptions(filtro, "");
      expect(screen.getByText("#0001")).toBeInTheDocument();
      expect(screen.getByText("#0002")).toBeInTheDocument();
    });

    it("?cliente=<nome> pré-preenche a pesquisa e filtra a lista", async () => {
      carregarDados();

      await renderizar(gerente(), "/ordens-servico?cliente=MARIA%20SOUZA");

      expect(await screen.findByText("#0002")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Pesquisar por veículo/)).toHaveValue(
        "MARIA SOUZA",
      );
      expect(screen.queryByText("#0001")).not.toBeInTheDocument();
    });

    it("?veiculo=<placa> pré-preenche a pesquisa e filtra a lista", async () => {
      carregarDados();

      await renderizar(gerente(), "/ordens-servico?veiculo=ABC1234");

      expect(await screen.findByText("#0001")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Pesquisar por veículo/)).toHaveValue(
        "ABC1234",
      );
      expect(screen.queryByText("#0002")).not.toBeInTheDocument();
    });

    it("sem query params a pesquisa começa vazia", async () => {
      carregarDados();

      await renderizar();
      await screen.findByText("#0001");

      expect(screen.getByPlaceholderText(/Pesquisar por veículo/)).toHaveValue(
        "",
      );
    });
  });

  describe("permissões", () => {
    it("GERENTE vê 'Nova Ordem de Serviço' e todas as ações", async () => {
      carregarDados([os1], []);

      await renderizar(gerente());
      await screen.findByText("#0001");

      expect(
        screen.getByRole("button", { name: /Nova Ordem de Serviço/ }),
      ).toBeInTheDocument();
      for (const acao of [
        "Visualizar ordem de serviço",
        "Atualizar status",
        "Imprimir ordem de serviço",
        "Editar ordem de serviço",
        "Excluir ordem de serviço",
      ]) {
        expect(screen.getByTitle(acao), acao).toBeInTheDocument();
      }
    });

    it("MECANICO não cria, edita nem exclui OS", async () => {
      carregarDados([os1], []);

      await renderizar(mecanico());
      await screen.findByText("#0001");

      expect(
        screen.queryByRole("button", { name: /Nova Ordem de Serviço/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle("Editar ordem de serviço"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle("Excluir ordem de serviço"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTitle("Visualizar ordem de serviço"),
      ).toBeInTheDocument();
      expect(screen.getByTitle("Atualizar status")).toBeInTheDocument();
      expect(
        screen.getByTitle("Imprimir ordem de serviço"),
      ).toBeInTheDocument();
    });
  });

  describe("atualização de status", () => {
    async function abrirStatus(usuario: ReturnType<typeof gerente>, os = os1) {
      carregarDados([os], []);
      const user = await renderizar(usuario);
      await screen.findByText(`#${os.id.toString().padStart(4, "0")}`);
      await user.click(screen.getByTitle("Atualizar status"));
      return user;
    }

    const opcoes = () =>
      within(document.querySelector<HTMLElement>(".form-content")!)
        .getAllByRole("option")
        .map((o) => o.textContent);

    it("GERENTE vê as transições permitidas a partir do status atual", async () => {
      await abrirStatus(gerente());

      expect(
        screen.getByRole("heading", { name: "Atualizar Status - OS #0001" }),
      ).toBeInTheDocument();
      expect(opcoes()).toEqual(["Diagnóstico", "Cancelada"]);
    });

    it("MECANICO não recebe destinos exclusivos do gerente (finalizar/entregar/cancelar)", async () => {
      await abrirStatus(mecanico(), ordemDeServico({ status: "EM_EXECUCAO" }));

      expect(
        screen.getByText("Não existem transições de status disponíveis."),
      ).toBeInTheDocument();
    });

    it("MECANICO mantém as transições operacionais", async () => {
      await abrirStatus(mecanico(), ordemDeServico({ status: "ABERTA" }));

      expect(opcoes()).toEqual(["Diagnóstico"]);
    });

    it("OS cancelada não tem nenhuma transição", async () => {
      await abrirStatus(gerente(), ordemDeServico({ status: "CANCELADA" }));

      expect(
        screen.getByText("Não existem transições de status disponíveis."),
      ).toBeInTheDocument();
    });

    it("FINALIZADA pode ser entregue ou reaberta", async () => {
      await abrirStatus(gerente(), ordemDeServico({ status: "FINALIZADA" }));

      expect(opcoes()).toEqual(["Entregue", "Aberta"]);
    });

    it("salvar envia PATCH com o novo status e atualiza a linha", async () => {
      let corpo: unknown;
      server.use(
        http.patch(`${API}/ordens-servico/1/status`, async ({ request }) => {
          corpo = await request.json();
          return HttpResponse.json(ordemDeServico({ status: "DIAGNOSTICO" }));
        }),
      );
      const user = await abrirStatus(gerente());

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() =>
        expect(
          within(linhaDe("#0001")).getByText("Diagnóstico"),
        ).toBeInTheDocument(),
      );
      expect(corpo).toEqual({ status: "DIAGNOSTICO" });
      expect(
        screen.queryByRole("heading", { name: /Atualizar Status/ }),
      ).not.toBeInTheDocument();
    });

    it("erro do backend (422) mantém o modal aberto e o status antigo", async () => {
      server.use(
        http.patch(`${API}/ordens-servico/1/status`, () =>
          HttpResponse.json({ message: "Transição inválida" }, { status: 422 }),
        ),
      );
      const user = await abrirStatus(gerente());

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() => expect(console.error).toHaveBeenCalled());
      expect(
        screen.getByRole("heading", { name: /Atualizar Status/ }),
      ).toBeInTheDocument();
      expect(within(linhaDe("#0001")).getByText("Aberta")).toBeInTheDocument();
    });
  });

  describe("exclusão", () => {
    it("confirmar exclui via API e remove a linha", async () => {
      carregarDados([os1, os2], []);
      const excluidas: string[] = [];
      server.use(
        http.delete(`${API}/ordens-servico/:id`, ({ params }) => {
          excluidas.push(String(params.id));
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(
        within(linhaDe("#0001")).getByTitle("Excluir ordem de serviço"),
      );
      expect(
        screen.getByRole("heading", { name: "Excluir Ordem de serviço" }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() =>
        expect(screen.queryByText("#0001")).not.toBeInTheDocument(),
      );
      expect(excluidas).toEqual(["1"]);
      expect(screen.getByText("#0002")).toBeInTheDocument();
    });

    it("OS com pagamento recebido (409) continua na lista", async () => {
      carregarDados([os1], []);
      server.use(
        http.delete(`${API}/ordens-servico/1`, () =>
          HttpResponse.json(
            {
              message:
                "Uma Ordem de Serviço não pode ser deletada com pagamento existente.",
            },
            { status: 409 },
          ),
        ),
      );
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(screen.getByTitle("Excluir ordem de serviço"));
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() => expect(console.error).toHaveBeenCalled());
      expect(
        within(screen.getByRole("table")).getByText("#0001"),
      ).toBeInTheDocument();
    });

    it("Cancelar não chama a API", async () => {
      carregarDados([os1], []);
      let deletes = 0;
      server.use(
        http.delete(`${API}/ordens-servico/1`, () => {
          deletes++;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(screen.getByTitle("Excluir ordem de serviço"));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.getByText("#0001")).toBeInTheDocument();
      expect(deletes).toBe(0);
    });
  });

  describe("criação", () => {
    function handlersDeAutocomplete() {
      server.use(
        http.get(`${API}/unidades`, () =>
          HttpResponse.json([
            {
              id: 1,
              oficinaId: 7,
              nome: "UNIDADE CENTRAL",
              endereco: "RUA A, 10",
              telefone: "83900000000",
            },
          ]),
        ),
        http.get(`${API}/veiculos/buscar`, () =>
          HttpResponse.json({
            content: [
              {
                id: 1,
                oficinaId: 7,
                placa: "ABC1234",
                marca: "HONDA",
                modelo: "CIVIC",
                ano: 2020,
                cor: "AZUL",
              },
            ],
            totalElements: 1,
            totalPages: 1,
          }),
        ),
      );
    }

    async function escolher(
      user: ReturnType<typeof userEvent.setup>,
      placeholder: RegExp,
      digitado: string,
      opcao: string,
    ) {
      await user.type(screen.getByPlaceholderText(placeholder), digitado);
      const dropdown = await waitFor(
        () => {
          const el = document.querySelector<HTMLElement>(
            ".entity-autocomplete-dropdown",
          );
          expect(el).not.toBeNull();
          return el!;
        },
        { timeout: 2000 },
      );
      await user.click(await within(dropdown).findByText(opcao));
    }

    it("abre o formulário de cadastro", async () => {
      carregarDados([os1], []);
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(
        screen.getByRole("button", { name: /Nova Ordem de Serviço/ }),
      );

      expect(
        screen.getByRole("heading", { name: "Cadastro de Ordem de Serviço" }),
      ).toBeInTheDocument();
    });

    it("unidade e veículo são obrigatórios; cliente e mecânico são opcionais", async () => {
      carregarDados([os1], []);
      let posts = 0;
      server.use(
        http.post(`${API}/ordens-servico`, () => {
          posts++;
          return HttpResponse.json(os1, { status: 201 });
        }),
      );
      const user = await renderizar();
      await screen.findByText("#0001");
      await user.click(
        screen.getByRole("button", { name: /Nova Ordem de Serviço/ }),
      );

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(screen.getByText("Unidade é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Veículo é obrigatório")).toBeInTheDocument();
      expect(
        screen.queryByText("Cliente é obrigatório"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Mecânico é obrigatório"),
      ).not.toBeInTheDocument();
      expect(posts).toBe(0);
    });

    it("escolhe unidade e veículo nas buscas, cria a OS e a adiciona à lista", async () => {
      carregarDados([os1], []);
      handlersDeAutocomplete();
      let corpo: Record<string, unknown> = {};
      server.use(
        http.post(`${API}/ordens-servico`, async ({ request }) => {
          corpo = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            ordemDeServico({
              id: 3,
              placaVeiculo: "ABC1234",
              nomeCliente: "",
              status: "ABERTA",
            }),
            { status: 201 },
          );
        }),
      );
      const user = await renderizar();
      await screen.findByText("#0001");
      await user.click(
        screen.getByRole("button", { name: /Nova Ordem de Serviço/ }),
      );

      await escolher(user, /nome da unidade/, "cent", "UNIDADE CENTRAL");
      await escolher(user, /placa ou modelo/, "abc", "ABC1234");
      await user.type(
        screen.getByPlaceholderText(/observações quando necessário/),
        "Troca de óleo",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("#0003")).toBeInTheDocument();
      expect(corpo).toMatchObject({
        unidadeId: 1,
        veiculoId: 1,
        obs: "Troca de óleo",
      });
      expect(
        screen.queryByRole("heading", { name: "Cadastro de Ordem de Serviço" }),
      ).not.toBeInTheDocument();
    });

    it("erro da API ao criar aparece no formulário", async () => {
      carregarDados([os1], []);
      handlersDeAutocomplete();
      server.use(
        http.post(`${API}/ordens-servico`, () =>
          HttpResponse.json(
            { message: "Veículo não encontrado" },
            { status: 404 },
          ),
        ),
      );
      const user = await renderizar();
      await screen.findByText("#0001");
      await user.click(
        screen.getByRole("button", { name: /Nova Ordem de Serviço/ }),
      );
      await escolher(user, /nome da unidade/, "cent", "UNIDADE CENTRAL");
      await escolher(user, /placa ou modelo/, "abc", "ABC1234");

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Veículo não encontrado"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Cadastro de Ordem de Serviço" }),
      ).toBeInTheDocument();
    });
  });

  describe("edição", () => {
    it("abre com os vínculos carregados, envia PUT e atualiza a linha", async () => {
      carregarDados([os1], []);
      let corpo: unknown;
      server.use(
        http.get(`${API}/unidades/1`, () =>
          HttpResponse.json({
            id: 1,
            oficinaId: 7,
            nome: "UNIDADE CENTRAL",
            endereco: "RUA A, 10",
            telefone: "",
          }),
        ),
        http.get(`${API}/veiculos/1`, () =>
          HttpResponse.json({
            id: 1,
            oficinaId: 7,
            placa: "ABC1234",
            marca: "HONDA",
            modelo: "CIVIC",
            ano: 2020,
            cor: "AZUL",
          }),
        ),
        http.get(`${API}/clientes/1`, () =>
          HttpResponse.json({
            id: 1,
            nome: "JOAO SILVA",
            documento: "12345678901",
            telefone: "",
            oficinaId: 7,
          }),
        ),
        http.get(`${API}/mecanicos/1`, () =>
          HttpResponse.json({
            id: 1,
            nome: "CARLOS",
            documento: "98765432100",
            telefone: "",
            oficinaId: 7,
            salario: 0,
            obs: "",
          }),
        ),
        http.put(`${API}/ordens-servico/1`, async ({ request }) => {
          corpo = await request.json();
          return HttpResponse.json(ordemDeServico({ obs: "Nova observação" }));
        }),
      );
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(screen.getByTitle("Editar ordem de serviço"));

      expect(
        screen.getByRole("heading", { name: "Editar Ordem de Serviço" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByDisplayValue("UNIDADE CENTRAL"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("ABC1234")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/observações quando necessário/),
      ).toHaveValue("Revisão geral");

      const obs = screen.getByPlaceholderText(/observações quando necessário/);
      await user.clear(obs);
      await user.type(obs, "Nova observação");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { name: "Editar Ordem de Serviço" }),
        ).not.toBeInTheDocument(),
      );
      expect(corpo).toEqual({
        unidadeId: 1,
        veiculoId: 1,
        clienteId: 1,
        mecanicoId: 1,
        obs: "Nova observação",
      });
    });
  });

  describe("impressão", () => {
    it("baixa o PDF da OS com o nome ordem-servico-<id>.pdf", async () => {
      carregarDados([os1], []);
      let authorization: string | null = null;
      localStorage.setItem("accessToken", "jwt-de-teste");
      server.use(
        http.get(`${API}/ordens-servico/1/pdf`, ({ request }) => {
          authorization = request.headers.get("Authorization");
          return new HttpResponse(new Blob(["%PDF-1.4"]), {
            headers: { "Content-Type": "application/pdf" },
          });
        }),
      );
      Object.defineProperty(URL, "createObjectURL", {
        value: vi.fn(() => "blob:os-1"),
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
      const user = await renderizar();
      await screen.findByText("#0001");

      await user.click(screen.getByTitle("Imprimir ordem de serviço"));

      await waitFor(() => expect(baixados).toEqual(["ordem-servico-1.pdf"]));
      expect(authorization).toBe("Bearer jwt-de-teste");
    });
  });
});
