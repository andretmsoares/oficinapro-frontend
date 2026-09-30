import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Usuarios } from "../../src/pages/Usuarios";
import type { Usuario } from "../../src/types/usuario/usuario";
import { API, adminSaas, gerente, pagina, usuario } from "../mocks/factories";
import { server } from "../mocks/server";
import { renderComRota } from "../helpers/render";

const ana = usuario({ id: 10, nome: "ANA GERENTE", username: "ana.g" });
const bloqueado = usuario({
  id: 11,
  nome: "BRUNO MECANICO",
  username: "bruno.m",
  role: "MECANICO",
  bloqueado: true,
});
const administrador = usuario({
  id: 12,
  nome: "ADMIN GLOBAL",
  username: "admin.g",
  role: "ADMIN",
  oficinaId: null,
});

function listar(usuarios: Usuario[]) {
  const estado = { usuarios };
  server.use(
    http.get(`${API}/usuarios/buscar`, () =>
      HttpResponse.json(pagina(estado.usuarios)),
    ),
  );
  return estado;
}

const linhaDe = (nome: string) => screen.getByText(nome).closest("tr")!;

describe("Página de Usuários", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("listagem", () => {
    it("mostra nome, papel traduzido e situação de acesso de cada usuário", async () => {
      listar([ana, bloqueado]);

      renderComRota(<Usuarios usuarioLogado={gerente()} />);

      expect(await screen.findByText("ANA GERENTE")).toBeInTheDocument();
      expect(
        within(linhaDe("ANA GERENTE")).getByText("Gerente"),
      ).toBeInTheDocument();
      expect(
        within(linhaDe("ANA GERENTE")).getByText("Liberado"),
      ).toBeInTheDocument();
      expect(
        within(linhaDe("BRUNO MECANICO")).getByText("Mecânico"),
      ).toBeInTheDocument();
      expect(
        within(linhaDe("BRUNO MECANICO")).getByText("Bloqueado"),
      ).toBeInTheDocument();
    });

    it("sem usuários mostra o estado vazio", async () => {
      listar([]);

      renderComRota(<Usuarios usuarioLogado={gerente()} />);

      expect(
        await screen.findByText("Nenhum usuário cadastrado"),
      ).toBeInTheDocument();
    });

    it("GERENTE não vê a coluna Oficina; ADMIN vê o nome (resolvido pela API) ou 'Global'", async () => {
      listar([ana, administrador]);
      server.use(
        http.get(`${API}/oficinas/7`, () =>
          HttpResponse.json({
            id: 7,
            nome: "OFICINA CENTRAL",
            cnpj: "12345678000195",
            telefone: "",
            ativo: true,
          }),
        ),
      );

      const { unmount } = renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("ANA GERENTE");
      expect(
        screen.queryByRole("columnheader", { name: "Oficina" }),
      ).not.toBeInTheDocument();
      unmount();

      renderComRota(<Usuarios usuarioLogado={adminSaas()} />);
      await screen.findByText("ANA GERENTE");
      expect(
        screen.getByRole("columnheader", { name: "Oficina" }),
      ).toBeInTheDocument();
      expect(
        await within(linhaDe("ANA GERENTE")).findByText("OFICINA CENTRAL"),
      ).toBeInTheDocument();
      expect(
        within(linhaDe("ADMIN GLOBAL")).getByText("Global"),
      ).toBeInTheDocument();
    });

    it("oficina que não existe mais aparece como 'Oficina não encontrada'", async () => {
      listar([ana]);
      server.use(
        http.get(
          `${API}/oficinas/7`,
          () => new HttpResponse(null, { status: 404 }),
        ),
      );

      renderComRota(<Usuarios usuarioLogado={adminSaas()} />);

      expect(
        await screen.findByText("Oficina não encontrada"),
      ).toBeInTheDocument();
    });

    it("'Visualizar usuário' mostra o username e o papel", async () => {
      listar([ana]);
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("ANA GERENTE");

      await user.click(screen.getByTitle("Visualizar usuário"));

      expect(await screen.findByText("@ana.g")).toBeInTheDocument();
    });
  });

  describe("desbloqueio de login", () => {
    it("só oferece 'Desbloquear login' para usuário bloqueado", async () => {
      listar([ana, bloqueado]);

      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("ANA GERENTE");

      expect(
        within(linhaDe("ANA GERENTE")).queryByTitle("Desbloquear login"),
      ).not.toBeInTheDocument();
      expect(
        within(linhaDe("BRUNO MECANICO")).getByTitle("Desbloquear login"),
      ).toBeInTheDocument();
    });

    it("desbloquear chama PATCH e recarrega a lista mostrando o acesso liberado", async () => {
      const estado = listar([bloqueado]);
      const chamadas: string[] = [];
      server.use(
        http.patch(`${API}/usuarios/:id/desbloquear`, ({ params }) => {
          chamadas.push(String(params.id));
          estado.usuarios = [{ ...bloqueado, bloqueado: false }];
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("Bloqueado");

      await user.click(screen.getByTitle("Desbloquear login"));

      expect(await screen.findByText("Liberado")).toBeInTheDocument();
      expect(chamadas).toEqual(["11"]);
      expect(screen.queryByTitle("Desbloquear login")).not.toBeInTheDocument();
    });

    it("falha ao desbloquear mostra o erro da API", async () => {
      listar([bloqueado]);
      server.use(
        http.patch(`${API}/usuarios/11/desbloquear`, () =>
          HttpResponse.json(
            { message: "Usuário não encontrado" },
            { status: 404 },
          ),
        ),
      );
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("Bloqueado");

      await user.click(screen.getByTitle("Desbloquear login"));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Usuário não encontrado",
      );
      expect(screen.getByText("Bloqueado")).toBeInTheDocument();
    });
  });

  describe("cadastro", () => {
    async function abrirCadastro(logado: Usuario) {
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={logado} />);
      await screen.findByText("ANA GERENTE");
      await user.click(screen.getByRole("button", { name: /Novo Usuário/ }));
      return user;
    }

    const opcoesDeCargo = () =>
      within(document.querySelector<HTMLElement>(".form-content")!)
        .getAllByRole("option")
        .map((o) => o.textContent);

    async function preencherBasico(user: ReturnType<typeof userEvent.setup>) {
      await user.type(
        screen.getByPlaceholderText("Digite o nome do usuário"),
        "Carla Nova",
      );
      await user.type(
        screen.getByPlaceholderText("Digite o CPF do usuário"),
        "11122233344",
      );
      await user.type(
        screen.getByPlaceholderText("Digite o telefone do usuário"),
        "83977776666",
      );
      await user.type(
        screen.getByPlaceholderText("Digite o username do usuário"),
        "carla.n",
      );
      await user.type(
        screen.getByPlaceholderText("Digite a senha do usuário"),
        "senha1234",
      );
    }

    it("GERENTE só pode criar Gerente ou Mecânico (sem opção de Administrador)", async () => {
      listar([ana]);

      await abrirCadastro(gerente());

      expect(opcoesDeCargo()).toEqual([
        "Escolha o cargo do usuário",
        "Gerente",
        "Mecânico",
      ]);
      expect(
        screen.queryByPlaceholderText("Digite nome ou CNPJ..."),
      ).not.toBeInTheDocument();
    });

    it("ADMIN do SaaS pode criar qualquer cargo e escolhe a oficina", async () => {
      listar([ana]);
      server.use(
        http.get(`${API}/oficinas/7`, () =>
          HttpResponse.json({ id: 7, nome: "OFICINA CENTRAL" }),
        ),
      );

      await abrirCadastro(adminSaas());

      expect(opcoesDeCargo()).toEqual([
        "Escolha o cargo do usuário",
        "Administrador",
        "Gerente",
        "Mecânico",
      ]);
      expect(
        screen.getByPlaceholderText("Digite nome ou CNPJ..."),
      ).toBeInTheDocument();
    });

    it("ao escolher Administrador o campo de oficina some (ADMIN não pertence a oficina)", async () => {
      listar([ana]);
      server.use(
        http.get(`${API}/oficinas/7`, () =>
          HttpResponse.json({ id: 7, nome: "OFICINA CENTRAL" }),
        ),
      );
      const user = await abrirCadastro(adminSaas());

      await user.selectOptions(
        within(document.querySelector<HTMLElement>(".form-content")!).getByRole(
          "combobox",
        ),
        "ADMIN",
      );

      expect(
        screen.queryByPlaceholderText("Digite nome ou CNPJ..."),
      ).not.toBeInTheDocument();
    });

    it("todos os campos são obrigatórios", async () => {
      listar([ana]);
      let posts = 0;
      server.use(
        http.post(`${API}/usuarios`, () => {
          posts++;
          return HttpResponse.json(ana, { status: 201 });
        }),
      );
      const user = await abrirCadastro(gerente());

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      for (const campo of [
        "Nome",
        "CPF",
        "Telefone",
        "Username",
        "Senha",
        "Cargo",
      ]) {
        expect(
          screen.getByText(`${campo} é obrigatório`),
          campo,
        ).toBeInTheDocument();
      }
      expect(posts).toBe(0);
    });

    it("GERENTE cria usuário sempre na própria oficina", async () => {
      const estado = listar([ana]);
      let corpo: unknown;
      server.use(
        http.post(`${API}/usuarios`, async ({ request }) => {
          corpo = await request.json();
          estado.usuarios = [
            ana,
            usuario({
              id: 20,
              nome: "CARLA NOVA",
              username: "carla.n",
              role: "MECANICO",
            }),
          ];
          return HttpResponse.json(estado.usuarios[1], { status: 201 });
        }),
      );
      const user = await abrirCadastro(gerente({ oficinaId: 7 }));

      await preencherBasico(user);
      await user.selectOptions(
        within(document.querySelector<HTMLElement>(".form-content")!).getByRole(
          "combobox",
        ),
        "MECANICO",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("CARLA NOVA")).toBeInTheDocument();
      expect(corpo).toEqual({
        nome: "Carla Nova",
        documento: "11122233344",
        telefone: "83977776666",
        username: "carla.n",
        password: "senha1234",
        role: "MECANICO",
        oficinaId: 7,
      });
      expect(
        screen.queryByRole("heading", { name: "Cadastro de Usuário" }),
      ).not.toBeInTheDocument();
    });

    it("ADMIN criando outro ADMIN envia oficinaId nulo", async () => {
      listar([ana]);
      server.use(
        http.get(`${API}/oficinas/7`, () =>
          HttpResponse.json({ id: 7, nome: "OFICINA CENTRAL" }),
        ),
      );
      let corpo: Record<string, unknown> = {};
      server.use(
        http.post(`${API}/usuarios`, async ({ request }) => {
          corpo = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(administrador, { status: 201 });
        }),
      );
      const user = await abrirCadastro(adminSaas());

      await preencherBasico(user);
      await user.selectOptions(
        within(document.querySelector<HTMLElement>(".form-content")!).getByRole(
          "combobox",
        ),
        "ADMIN",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() => expect(corpo.role).toBe("ADMIN"));
      expect(corpo.oficinaId).toBeNull();
    });

    it("username já usado (409) aparece no formulário", async () => {
      listar([ana]);
      server.use(
        http.post(`${API}/usuarios`, () =>
          HttpResponse.json(
            { message: "Este username já está em uso" },
            { status: 409 },
          ),
        ),
      );
      const user = await abrirCadastro(gerente());
      await preencherBasico(user);
      await user.selectOptions(
        within(document.querySelector<HTMLElement>(".form-content")!).getByRole(
          "combobox",
        ),
        "GERENTE",
      );

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Este username já está em uso"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Cadastro de Usuário" }),
      ).toBeInTheDocument();
    });
  });

  describe("remoção", () => {
    it("confirmar remove o usuário via API e recarrega a lista", async () => {
      const estado = listar([ana, bloqueado]);
      const removidos: string[] = [];
      server.use(
        http.delete(`${API}/usuarios/:id`, ({ params }) => {
          removidos.push(String(params.id));
          estado.usuarios = [ana];
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("BRUNO MECANICO");

      await user.click(
        within(linhaDe("BRUNO MECANICO")).getByTitle("Remover usuário"),
      );
      expect(
        screen.getByRole("heading", { name: "Excluir Usuário" }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() =>
        expect(screen.queryByText("BRUNO MECANICO")).not.toBeInTheDocument(),
      );
      expect(removidos).toEqual(["11"]);
    });

    it("Cancelar mantém o usuário", async () => {
      listar([ana]);
      const user = userEvent.setup();
      renderComRota(<Usuarios usuarioLogado={gerente()} />);
      await screen.findByText("ANA GERENTE");

      await user.click(screen.getByTitle("Remover usuário"));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(
        screen.queryByRole("heading", { name: "Excluir Usuário" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("ANA GERENTE")).toBeInTheDocument();
    });
  });
});
