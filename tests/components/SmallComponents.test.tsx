import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { ConfirmDeleteEntity } from "../../src/components/ConfirmDeleteEntity";
import { Pagination } from "../../src/components/Pagination";
import { SearchBar } from "../../src/components/SearchBar";
import { SelectStatusModal } from "../../src/components/SelectStatusModal";
import { Sidebar } from "../../src/components/Sidebar";
import { StatusFilter } from "../../src/components/StatusFilter";
import { adminSaas, gerente, mecanico } from "../mocks/factories";

describe("ConfirmDeleteEntity", () => {
  function renderConfirm() {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDeleteEntity
        text="Cliente"
        entity="o cliente"
        entityName="JOAO SILVA"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    return { onConfirm, onCancel, user: userEvent.setup() };
  }

  it("pergunta pelo nome da entidade e avisa que não pode ser desfeito", () => {
    renderConfirm();

    expect(
      screen.getByRole("heading", { name: "Excluir Cliente" }),
    ).toBeInTheDocument();
    expect(screen.getByText("JOAO SILVA")).toBeInTheDocument();
    expect(screen.getByText(/não poderá ser desfeita/i)).toBeInTheDocument();
  });

  it("Excluir confirma e Cancelar desiste", async () => {
    const { onConfirm, onCancel, user } = renderConfirm();

    await user.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("clicar fora do diálogo cancela; clicar dentro não", async () => {
    const { onCancel, user } = renderConfirm();

    await user.click(screen.getByText("JOAO SILVA"));
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(document.querySelector(".delete-modal-overlay")!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("aceita título, mensagem e texto de confirmação customizados", () => {
    render(
      <ConfirmDeleteEntity
        text=""
        entity=""
        entityName=""
        title="Remover pagamento"
        message="Remover pagamento de R$ 10,00?"
        confirmText="Remover"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Remover pagamento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remover pagamento de R$ 10,00?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover" })).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("na primeira página desabilita Anterior e permite avançar", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Pagination
        page={0}
        totalPages={3}
        totalElements={45}
        onPageChange={onPageChange}
      />,
    );

    expect(
      screen.getByText(/45 registro\(s\) · página 1 de 3/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /próxima/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("na última página desabilita Próxima e permite voltar", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Pagination
        page={2}
        totalPages={3}
        totalElements={45}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button", { name: /próxima/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("sem resultados mostra página 0 de 0 e desabilita os dois botões", () => {
    render(
      <Pagination
        page={0}
        totalPages={0}
        totalElements={0}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/0 registro\(s\) · página 0 de 0/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /próxima/i })).toBeDisabled();
  });
});

describe("SearchBar", () => {
  it("mostra o termo atual e notifica cada alteração", async () => {
    const setSearchTerm = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchBar
        placeholder="Pesquisar"
        searchTerm="ab"
        setSearchTerm={setSearchTerm}
      />,
    );

    const campo = screen.getByPlaceholderText("Pesquisar");
    expect(campo).toHaveValue("ab");

    await user.type(campo, "c");
    expect(setSearchTerm).toHaveBeenCalledWith("abc");
  });
});

describe("StatusFilter", () => {
  const opcoes = [
    { value: "ABERTA", label: "Aberta" },
    { value: "FECHADA", label: "Fechada" },
  ];

  it("oferece 'Todos' mais as opções e notifica a escolha", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <StatusFilter
        label="Filtrar por status"
        value=""
        options={opcoes}
        onChange={onChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Filtrar por status" });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Todos",
      "Aberta",
      "Fechada",
    ]);

    await user.selectOptions(select, "FECHADA");
    expect(onChange).toHaveBeenCalledWith("FECHADA");
  });

  it("voltar para 'Todos' emite string vazia", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <StatusFilter
        label="Status"
        value="ABERTA"
        options={opcoes}
        onChange={onChange}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "");

    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("SelectStatusModal", () => {
  it("salva o primeiro status por padrão", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(
      <SelectStatusModal
        title="Atualizar Status - OS #0001"
        currentStatus="ABERTA"
        statuses={[
          { value: "DIAGNOSTICO", label: "Diagnóstico" },
          { value: "CANCELADA", label: "Cancelada" },
        ]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSave).toHaveBeenCalledWith("DIAGNOSTICO");
  });

  it("salva o status escolhido pelo usuário", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(
      <SelectStatusModal
        currentStatus="ABERTA"
        statuses={[
          { value: "DIAGNOSTICO", label: "Diagnóstico" },
          { value: "CANCELADA", label: "Cancelada" },
        ]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "CANCELADA");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSave).toHaveBeenCalledWith("CANCELADA");
  });

  it("sem transições disponíveis avisa e não chama onSave ao salvar", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(
      <SelectStatusModal
        currentStatus="CANCELADA"
        statuses={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Não existem transições de status disponíveis."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("Sidebar (navegação por papel)", () => {
  function renderSidebar(
    usuario: Parameters<typeof Sidebar>[0]["usuarioLogado"],
    onLogout = vi.fn(),
  ) {
    render(
      <MemoryRouter>
        <Sidebar usuarioLogado={usuario} onLogout={onLogout} />
      </MemoryRouter>,
    );
    return onLogout;
  }

  const link = (nome: string) => screen.queryByRole("link", { name: nome });

  it("GERENTE vê todas as áreas operacionais e administrativas da oficina", () => {
    renderSidebar(gerente());

    for (const nome of [
      "Dashboard",
      "Clientes",
      "Veículos",
      "Ordens de Serviço",
      "Peças",
      "Mecânicos",
      "Pagamentos",
      "Usuários",
      "Unidades",
    ]) {
      expect(link(nome), nome).toBeInTheDocument();
    }
    expect(link("Oficinas")).not.toBeInTheDocument();
  });

  it("MECANICO vê só as áreas operacionais", () => {
    renderSidebar(mecanico());

    for (const nome of [
      "Dashboard",
      "Clientes",
      "Veículos",
      "Ordens de Serviço",
    ]) {
      expect(link(nome), nome).toBeInTheDocument();
    }
    for (const nome of [
      "Peças",
      "Mecânicos",
      "Pagamentos",
      "Usuários",
      "Unidades",
    ]) {
      expect(link(nome), nome).not.toBeInTheDocument();
    }
  });

  it("ADMIN do SaaS vê apenas Oficinas e Usuários", () => {
    renderSidebar(adminSaas());

    expect(link("Oficinas")).toHaveAttribute("href", "/admin/oficinas");
    expect(link("Usuários")).toHaveAttribute("href", "/admin/usuarios");
    for (const nome of [
      "Dashboard",
      "Clientes",
      "Ordens de Serviço",
      "Pagamentos",
    ]) {
      expect(link(nome), nome).not.toBeInTheDocument();
    }
  });

  it("Sair dispara o logout", async () => {
    const user = userEvent.setup();
    const onLogout = renderSidebar(gerente());

    await user.click(screen.getByRole("button", { name: /sair/i }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
