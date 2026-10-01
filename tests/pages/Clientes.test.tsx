import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Clientes } from "../../src/pages/Clientes";
import { API, cliente, gerente, mecanico, pagina } from "../mocks/factories";
import { server } from "../mocks/server";
import { renderComRota } from "../helpers/render";

const joao = cliente();
const maria = cliente({
  id: 2,
  nome: "MARIA SOUZA",
  documento: "98765432100",
  telefone: "83911112222",
});

/** Registra GET /clientes/buscar e guarda os parâmetros de cada consulta. */
function listarClientes(
  resposta: (params: URLSearchParams) => ReturnType<typeof pagina>,
) {
  const consultas: URLSearchParams[] = [];
  server.use(
    http.get(`${API}/clientes/buscar`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      consultas.push(params);
      return HttpResponse.json(resposta(params));
    }),
  );
  return consultas;
}

describe("Página de Clientes", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("listagem", () => {
    it("mostra 'Carregando...' e depois os clientes formatados", async () => {
      listarClientes(() => pagina([joao, maria]));

      renderComRota(<Clientes usuarioLogado={gerente()} />);

      expect(screen.getByText("Carregando...")).toBeInTheDocument();
      expect(await screen.findByText("JOAO SILVA")).toBeInTheDocument();

      const linha = screen.getByText("JOAO SILVA").closest("tr")!;
      expect(within(linha).getByText("#0001")).toBeInTheDocument();
      expect(within(linha).getByText("123.456.789-01")).toBeInTheDocument();
      expect(within(linha).getByText("(83) 98888-7777")).toBeInTheDocument();
      expect(screen.getByText("MARIA SOUZA")).toBeInTheDocument();
    });

    it("consulta a primeira página ordenada por nome e mostra o total no cartão", async () => {
      const consultas = listarClientes(() => pagina([joao, maria]));

      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      expect(consultas[0].get("page")).toBe("0");
      expect(consultas[0].get("sort")).toBe("nome");
      expect(consultas[0].get("q")).toBe("");
      expect(
        screen.getByText("Clientes Cadastrados").closest(".stat-card"),
      ).toHaveTextContent("2");
      expect(screen.getByText("Total na base de dados")).toBeInTheDocument();
    });

    it("sem clientes mostra o estado vazio", async () => {
      listarClientes(() => pagina([], 0));

      renderComRota(<Clientes usuarioLogado={gerente()} />);

      expect(
        await screen.findByText("Nenhum cliente cadastrado"),
      ).toBeInTheDocument();
    });

    it("erro da API na listagem deixa de carregar e não quebra a tela", async () => {
      server.use(
        http.get(
          `${API}/clientes/buscar`,
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      renderComRota(<Clientes usuarioLogado={gerente()} />);

      expect(
        await screen.findByText("Nenhum cliente cadastrado"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    it("busca no servidor com o termo digitado e mostra mensagem quando nada é encontrado", async () => {
      const user = userEvent.setup();
      const consultas = listarClientes((params) =>
        params.get("q") === "zzz" ? pagina([], 0) : pagina([joao, maria]),
      );
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      await user.type(screen.getByPlaceholderText(/Pesquisar clientes/), "zzz");

      expect(
        await screen.findByText("Nenhum cliente encontrado para a busca"),
      ).toBeInTheDocument();
      expect(consultas.at(-1)?.get("q")).toBe("zzz");
      expect(consultas.at(-1)?.get("page")).toBe("0");
      expect(screen.getByText("Encontrados na busca")).toBeInTheDocument();
    });

    it("paginação pede a próxima página ao servidor", async () => {
      const user = userEvent.setup();
      const consultas = listarClientes((params) =>
        params.get("page") === "1" ? pagina([maria], 2) : pagina([joao], 2),
      );
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      await user.click(screen.getByRole("button", { name: /próxima/i }));

      expect(await screen.findByText("MARIA SOUZA")).toBeInTheDocument();
      expect(screen.queryByText("JOAO SILVA")).not.toBeInTheDocument();
      expect(consultas.at(-1)?.get("page")).toBe("1");
    });
  });

  describe("permissões", () => {
    it("GERENTE vê 'Novo Cliente' e as ações de editar e excluir", async () => {
      listarClientes(() => pagina([joao]));

      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      expect(
        screen.getByRole("button", { name: /Novo Cliente/ }),
      ).toBeInTheDocument();
      expect(screen.getByTitle("Editar cliente")).toBeInTheDocument();
      expect(screen.getByTitle("Excluir cliente")).toBeInTheDocument();
      expect(
        screen.getByTitle("Visualizar Ordens de Serviço"),
      ).toBeInTheDocument();
    });

    it("MECANICO só consulta: sem cadastro, edição ou exclusão", async () => {
      listarClientes(() => pagina([joao]));

      renderComRota(<Clientes usuarioLogado={mecanico()} />);
      await screen.findByText("JOAO SILVA");

      expect(
        screen.getByText("Consulte os clientes cadastrados"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Novo Cliente/ }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTitle("Editar cliente")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Excluir cliente")).not.toBeInTheDocument();
      expect(
        screen.getByTitle("Visualizar Ordens de Serviço"),
      ).toBeInTheDocument();
    });
  });

  describe("integração com Ordens de Serviço", () => {
    it("'Visualizar Ordens de Serviço' navega para /ordens-servico?cliente=<nome>", async () => {
      const user = userEvent.setup();
      listarClientes(() => pagina([maria]));
      renderComRota(<Clientes usuarioLogado={gerente()} />, "/clientes");
      await screen.findByText("MARIA SOUZA");

      await user.click(screen.getByTitle("Visualizar Ordens de Serviço"));

      expect(screen.getByTestId("localizacao")).toHaveTextContent(
        "/ordens-servico?cliente=MARIA%20SOUZA",
      );
    });
  });

  describe("criação", () => {
    async function abrirCadastro() {
      const user = userEvent.setup();
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");
      await user.click(screen.getByRole("button", { name: /Novo Cliente/ }));
      return user;
    }

    async function preencher(user: ReturnType<typeof userEvent.setup>) {
      await user.type(
        screen.getByPlaceholderText(/nome do cleinte/),
        "Pedro Lima",
      );
      await user.type(
        screen.getByPlaceholderText(/documento do cliente/),
        "11122233344",
      );
      await user.type(
        screen.getByPlaceholderText(/telefone do cliente/),
        "83977776666",
      );
    }

    it("abre o formulário vazio", async () => {
      listarClientes(() => pagina([joao]));

      await abrirCadastro();

      expect(
        screen.getByRole("heading", { name: "Cadastro de Cliente" }),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/nome do cleinte/)).toHaveValue("");
    });

    it("campos obrigatórios vazios não disparam requisição", async () => {
      listarClientes(() => pagina([joao]));
      let posts = 0;
      server.use(
        http.post(`${API}/clientes`, () => {
          posts++;
          return HttpResponse.json(joao, { status: 201 });
        }),
      );
      const user = await abrirCadastro();

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("CPF/CNPJ é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Telefone é obrigatório")).toBeInTheDocument();
      expect(posts).toBe(0);
    });

    it("cria o cliente com dígitos puros, fecha o formulário e recarrega a lista", async () => {
      let corpo: unknown;
      let clientes = [joao];
      listarClientes(() => pagina(clientes));
      server.use(
        http.post(`${API}/clientes`, async ({ request }) => {
          corpo = await request.json();
          const novo = cliente({ id: 3, nome: "PEDRO LIMA" });
          clientes = [...clientes, novo];
          return HttpResponse.json(novo, { status: 201 });
        }),
      );
      const user = await abrirCadastro();

      await preencher(user);
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("PEDRO LIMA")).toBeInTheDocument();
      expect(corpo).toEqual({
        nome: "Pedro Lima",
        documento: "11122233344",
        telefone: "83977776666",
      });
      expect(
        screen.queryByRole("heading", { name: "Cadastro de Cliente" }),
      ).not.toBeInTheDocument();
    });

    it("erro 409 da API aparece no formulário, que permanece aberto", async () => {
      listarClientes(() => pagina([joao]));
      server.use(
        http.post(`${API}/clientes`, () =>
          HttpResponse.json(
            { message: "Cliente já cadastrado com esse documento" },
            { status: 409 },
          ),
        ),
      );
      const user = await abrirCadastro();

      await preencher(user);
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Cliente já cadastrado com esse documento"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Cadastro de Cliente" }),
      ).toBeInTheDocument();
    });

    it("erro de validação do backend (400) mostra os campos na mensagem", async () => {
      listarClientes(() => pagina([joao]));
      server.use(
        http.post(`${API}/clientes`, () =>
          HttpResponse.json(
            {
              message: "Dados inválidos",
              fields: { documento: "Documento inválido" },
            },
            { status: 400 },
          ),
        ),
      );
      const user = await abrirCadastro();

      await preencher(user);
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText(
          "Dados inválidos (documento: Documento inválido)",
        ),
      ).toBeInTheDocument();
    });

    it("Fechar descarta o cadastro sem enviar nada", async () => {
      listarClientes(() => pagina([joao]));
      const user = await abrirCadastro();

      await user.click(screen.getByRole("button", { name: "Fechar" }));

      expect(
        screen.queryByRole("heading", { name: "Cadastro de Cliente" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("edição", () => {
    it("abre com os dados do cliente, envia PUT e recarrega a lista", async () => {
      let corpo: unknown;
      let atual = joao;
      listarClientes(() => pagina([atual]));
      server.use(
        http.put(`${API}/clientes/1`, async ({ request }) => {
          corpo = await request.json();
          atual = cliente({ nome: "JOAO SILVA JUNIOR" });
          return HttpResponse.json(atual);
        }),
      );
      const user = userEvent.setup();
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      await user.click(screen.getByTitle("Editar cliente"));

      expect(
        screen.getByRole("heading", { name: "Editar Cliente" }),
      ).toBeInTheDocument();
      const nome = screen.getByPlaceholderText(/nome do cleinte/);
      expect(nome).toHaveValue("JOAO SILVA");
      expect(screen.getByPlaceholderText(/documento do cliente/)).toHaveValue(
        "123.456.789-01",
      );

      await user.type(nome, " JUNIOR");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("JOAO SILVA JUNIOR")).toBeInTheDocument();
      expect(corpo).toEqual({
        nome: "JOAO SILVA JUNIOR",
        documento: "12345678901",
        telefone: "83988887777",
      });
    });

    it("erro da API na edição mostra a mensagem e mantém o formulário", async () => {
      listarClientes(() => pagina([joao]));
      server.use(
        http.put(`${API}/clientes/1`, () =>
          HttpResponse.json(
            { message: "Cliente não encontrado" },
            { status: 404 },
          ),
        ),
      );
      const user = userEvent.setup();
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      await user.click(screen.getByTitle("Editar cliente"));
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Cliente não encontrado"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Editar Cliente" }),
      ).toBeInTheDocument();
    });
  });

  describe("exclusão", () => {
    it("pede confirmação citando o cliente e só exclui ao confirmar", async () => {
      const excluidos: string[] = [];
      let clientes = [joao, maria];
      listarClientes(() => pagina(clientes));
      server.use(
        http.delete(`${API}/clientes/:id`, ({ params }) => {
          excluidos.push(String(params.id));
          clientes = clientes.filter((c) => String(c.id) !== params.id);
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = userEvent.setup();
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      const linhaJoao = screen.getByText("JOAO SILVA").closest("tr")!;
      await user.click(within(linhaJoao).getByTitle("Excluir cliente"));

      expect(
        screen.getByRole("heading", { name: "Excluir Cliente" }),
      ).toBeInTheDocument();
      expect(excluidos).toEqual([]);

      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() =>
        expect(screen.queryByText("JOAO SILVA")).not.toBeInTheDocument(),
      );
      expect(excluidos).toEqual(["1"]);
      expect(screen.getByText("MARIA SOUZA")).toBeInTheDocument();
    });

    it("Cancelar mantém o cliente e não chama a API", async () => {
      listarClientes(() => pagina([joao]));
      let deletes = 0;
      server.use(
        http.delete(`${API}/clientes/1`, () => {
          deletes++;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = userEvent.setup();
      renderComRota(<Clientes usuarioLogado={gerente()} />);
      await screen.findByText("JOAO SILVA");

      await user.click(screen.getByTitle("Excluir cliente"));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(
        screen.queryByRole("heading", { name: "Excluir Cliente" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("JOAO SILVA")).toBeInTheDocument();
      expect(deletes).toBe(0);
    });
  });
});
