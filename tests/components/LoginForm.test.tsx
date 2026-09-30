import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "../../src/components/LoginForm";

function preencher(user: ReturnType<typeof userEvent.setup>) {
  return {
    async usuario(valor: string) {
      await user.type(screen.getByPlaceholderText("Usuário"), valor);
    },
    async senha(valor: string) {
      await user.type(screen.getByPlaceholderText("Senha"), valor);
    },
    async entrar() {
      await user.click(screen.getByRole("button", { name: /entrar/i }));
    },
  };
}

describe("LoginForm", () => {
  it("renderiza usuário, senha (mascarada) e o botão Entrar", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText("Usuário")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  it("envia exatamente o usuário e a senha digitados", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);
    const form = preencher(user);

    await form.usuario("ana.gerente");
    await form.senha("senha1234");
    await form.entrar();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("ana.gerente", "senha1234");
  });

  it("permite enviar com a tecla Enter", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Usuário"), "ana");
    await user.type(screen.getByPlaceholderText("Senha"), "senha1234{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("ana", "senha1234");
  });

  it("durante a requisição mostra 'Entrando...' e bloqueia campos e botão", async () => {
    let concluir: () => void = () => undefined;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (concluir = resolve)),
    );
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);
    const form = preencher(user);

    await form.usuario("ana");
    await form.senha("senha1234");
    await form.entrar();

    const botao = await screen.findByRole("button", { name: "Entrando..." });
    expect(botao).toBeDisabled();
    expect(screen.getByPlaceholderText("Usuário")).toBeDisabled();
    expect(screen.getByPlaceholderText("Senha")).toBeDisabled();

    concluir();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled(),
    );
  });

  it("exibe a mensagem de erro quando o login falha e libera o formulário", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("Usuário ou senha inválidos."));
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);
    const form = preencher(user);

    await form.usuario("ana");
    await form.senha("errada");
    await form.entrar();

    expect(
      await screen.findByText("Usuário ou senha inválidos."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.getByPlaceholderText("Usuário")).toBeEnabled();
  });

  it("usa mensagem padrão quando o erro não é uma instância de Error", async () => {
    const onSubmit = vi.fn().mockRejectedValue("falha estranha");
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Não foi possível realizar o login."),
    ).toBeInTheDocument();
  });

  it("limpa o erro anterior ao tentar novamente", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("Usuário ou senha inválidos."))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(
      await screen.findByText("Usuário ou senha inválidos."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(
        screen.queryByText("Usuário ou senha inválidos."),
      ).not.toBeInTheDocument(),
    );
  });
});
