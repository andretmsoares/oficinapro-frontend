import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Header } from "../../src/components/Header";
import { API, adminSaas, gerente } from "../mocks/factories";
import { server } from "../mocks/server";

function renderizar(usuario = gerente()) {
  const props = { onLogout: vi.fn(), onUpdateUsuarioLogado: vi.fn() };
  const user = userEvent.setup();
  render(<Header usuarioLogado={usuario} {...props} />);
  return { user, ...props };
}

async function abrirEdicao(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Ana Gerente/ }));
  await user.click(screen.getByRole("button", { name: /Editar dados/ }));
}

describe("Header", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("saúda o usuário e mostra o papel traduzido", () => {
    renderizar();

    expect(screen.getByText(/Olá, Ana Gerente/)).toBeInTheDocument();
    expect(screen.getByText("Gerente")).toBeInTheDocument();
    expect(
      screen.getByText("Confira o resumo da sua oficina hoje."),
    ).toBeInTheDocument();
  });

  it("ADMIN do SaaS vê a mensagem de administração da plataforma", () => {
    renderizar(adminSaas());

    expect(
      screen.getByText("Acompanhe e gerencie todas as oficinas do sistema."),
    ).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("o menu do usuário abre ao clicar e fecha ao clicar fora", async () => {
    const { user } = renderizar();

    expect(
      screen.queryByRole("button", { name: /Editar dados/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Ana Gerente/ }));
    expect(
      screen.getByRole("button", { name: /Editar dados/ }),
    ).toBeInTheDocument();

    await user.click(document.body);

    expect(
      screen.queryByRole("button", { name: /Editar dados/ }),
    ).not.toBeInTheDocument();
  });

  it("'Sair' do menu dispara o logout", async () => {
    const { user, onLogout } = renderizar();

    await user.click(screen.getByRole("button", { name: /Ana Gerente/ }));
    await user.click(screen.getByRole("button", { name: /^Sair$/ }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("'Editar dados' abre o formulário preenchido com os dados atuais", async () => {
    const { user } = renderizar();

    await abrirEdicao(user);

    expect(
      screen.getByRole("heading", { name: "Editar meus dados" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite o nome do usuário")).toHaveValue(
      "Ana Gerente",
    );
    expect(
      screen.getByPlaceholderText("Digite o username do usuário"),
    ).toHaveValue("ana.gerente");
    expect(
      screen.getByPlaceholderText("Digite o telefone do usuário"),
    ).toHaveValue("(83) 98888-7777");
  });

  it("salvar sem trocar o username atualiza os dados e não desloga", async () => {
    let corpo: unknown;
    server.use(
      http.put(`${API}/usuarios/me`, async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json(gerente({ nome: "Ana Maria" }));
      }),
    );
    const { user, onLogout, onUpdateUsuarioLogado } = renderizar();
    await abrirEdicao(user);

    const nome = screen.getByPlaceholderText("Digite o nome do usuário");
    await user.clear(nome);
    await user.type(nome, "Ana Maria");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(onUpdateUsuarioLogado).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Ana Maria" }),
      ),
    );
    expect(corpo).toEqual({
      nome: "Ana Maria",
      documento: "12345678901",
      telefone: "83988887777",
      username: "ana.gerente",
    });
    expect(onLogout).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Editar meus dados" }),
    ).not.toBeInTheDocument();
  });

  it("nova senha informada é enviada; em branco não vai no payload", async () => {
    const corpos: Record<string, unknown>[] = [];
    server.use(
      http.put(`${API}/usuarios/me`, async ({ request }) => {
        corpos.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(gerente());
      }),
    );
    const { user } = renderizar();
    await abrirEdicao(user);

    await user.type(
      screen.getByPlaceholderText(/Nova senha \(deixe em branco/),
      "outraSenha123",
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(corpos).toHaveLength(1));
    expect(corpos[0].password).toBe("outraSenha123");
  });

  it("trocar o username invalida o token atual e força o logout", async () => {
    server.use(
      http.put(`${API}/usuarios/me`, () =>
        HttpResponse.json(gerente({ username: "ana.nova" })),
      ),
    );
    const { user, onLogout, onUpdateUsuarioLogado } = renderizar();
    await abrirEdicao(user);

    const username = screen.getByPlaceholderText(
      "Digite o username do usuário",
    );
    await user.clear(username);
    await user.type(username, "ana.nova");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    expect(onUpdateUsuarioLogado).not.toHaveBeenCalled();
  });

  it("username já em uso (409) aparece no formulário, que continua aberto", async () => {
    server.use(
      http.put(`${API}/usuarios/me`, () =>
        HttpResponse.json(
          { message: "Este username já está em uso" },
          { status: 409 },
        ),
      ),
    );
    const { user, onLogout } = renderizar();
    await abrirEdicao(user);

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Este username já está em uso"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Editar meus dados" }),
    ).toBeInTheDocument();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("campos obrigatórios em branco bloqueiam o envio", async () => {
    let puts = 0;
    server.use(
      http.put(`${API}/usuarios/me`, () => {
        puts++;
        return HttpResponse.json(gerente());
      }),
    );
    const { user } = renderizar();
    await abrirEdicao(user);

    await user.clear(screen.getByPlaceholderText("Digite o nome do usuário"));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    expect(puts).toBe(0);
  });

  it("Fechar descarta a edição", async () => {
    const { user } = renderizar();
    await abrirEdicao(user);

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(
      screen.queryByRole("heading", { name: "Editar meus dados" }),
    ).not.toBeInTheDocument();
  });
});
