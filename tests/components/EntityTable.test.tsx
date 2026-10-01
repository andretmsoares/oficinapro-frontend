import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil, Trash2 } from "lucide-react";

import { EntityTable } from "../../src/components/EntityTable";
import type {
  Column,
  EntityAction,
} from "../../src/components/EntityTable/types";

type Item = { id: number; nome: string; cidade: string | null };

const itens: Item[] = [
  { id: 1, nome: "Ana", cidade: "Recife" },
  { id: 2, nome: "Bruno", cidade: null },
  { id: 3, nome: "Carla", cidade: "Natal" },
];

const colunas: Column<Item>[] = [
  { key: "id", header: "Código" },
  { key: "nome", header: "Nome", render: (i) => <strong>{i.nome}</strong> },
  { key: "cidade", header: "Cidade" },
];

function renderTabela(
  props: Partial<Parameters<typeof EntityTable<Item>>[0]> = {},
) {
  return render(
    <EntityTable<Item>
      data={itens}
      columns={colunas}
      getRowKey={(i) => i.id}
      {...props}
    />,
  );
}

describe("EntityTable", () => {
  it("renderiza cabeçalhos e uma linha por item", () => {
    renderTabela();

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent),
    ).toEqual(["Código", "Nome", "Cidade"]);
    expect(screen.getAllByRole("row")).toHaveLength(1 + itens.length);
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  it("célula com valor nulo aparece vazia (sem 'null')", () => {
    renderTabela();

    const linhaBruno = screen.getByText("Bruno").closest("tr")!;
    expect(within(linhaBruno).queryByText("null")).not.toBeInTheDocument();
  });

  it("mostra 'Carregando...' no lugar dos dados enquanto loading", () => {
    renderTabela({ loading: true });

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("sem dados mostra a mensagem de vazio informada", () => {
    renderTabela({ data: [], emptyMessage: "Nenhum cliente cadastrado" });

    expect(screen.getByText("Nenhum cliente cadastrado")).toBeInTheDocument();
  });

  it("usa a mensagem padrão quando nenhuma é informada", () => {
    renderTabela({ data: [] });

    expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
  });

  describe("busca local", () => {
    it("filtra ignorando maiúsculas/minúsculas nos campos informados", () => {
      renderTabela({ searchTerm: "CAR", searchFields: ["nome"] });

      expect(screen.getByText("Carla")).toBeInTheDocument();
      expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    });

    it("procura em mais de um campo", () => {
      renderTabela({ searchTerm: "natal", searchFields: ["nome", "cidade"] });

      expect(screen.getByText("Carla")).toBeInTheDocument();
      expect(screen.queryByText("Bruno")).not.toBeInTheDocument();
    });

    it("sem resultados mostra o termo pesquisado", () => {
      renderTabela({ searchTerm: "zzz", searchFields: ["nome"] });

      expect(
        screen.getByText('Nenhum resultado encontrado para "zzz"'),
      ).toBeInTheDocument();
    });

    it("termo em branco não filtra nada", () => {
      renderTabela({ searchTerm: "   ", searchFields: ["nome"] });

      expect(screen.getAllByRole("row")).toHaveLength(1 + itens.length);
    });

    it("sem searchFields nem searchFn a busca não filtra", () => {
      renderTabela({ searchTerm: "zzz" });

      expect(screen.getAllByRole("row")).toHaveLength(1 + itens.length);
    });

    it("searchFn tem precedência e recebe o termo em minúsculas", () => {
      const searchFn = vi.fn((item: Item, termo: string) =>
        item.nome.toLowerCase().startsWith(termo),
      );
      renderTabela({ searchTerm: "BR", searchFields: ["cidade"], searchFn });

      expect(screen.getByText("Bruno")).toBeInTheDocument();
      expect(screen.queryByText("Ana")).not.toBeInTheDocument();
      expect(searchFn).toHaveBeenCalledWith(itens[1], "br");
    });
  });

  describe("ações", () => {
    it("renderiza um botão por ação e chama o callback com o item da linha", async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const actions: EntityAction<Item>[] = [
        { label: "Editar", icon: Pencil, variant: "edit", onClick: onEdit },
        {
          label: "Excluir",
          icon: Trash2,
          variant: "delete",
          onClick: onDelete,
        },
      ];
      const user = userEvent.setup();
      renderTabela({ actions });

      const linhaCarla = screen.getByText("Carla").closest("tr")!;
      await user.click(within(linhaCarla).getByTitle("Excluir"));

      expect(onDelete).toHaveBeenCalledWith(itens[2]);
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getAllByTitle("Editar")).toHaveLength(itens.length);
    });

    it("esconde a ação por linha quando hidden() retorna true", () => {
      const actions: EntityAction<Item>[] = [
        {
          label: "Excluir",
          icon: Trash2,
          onClick: vi.fn(),
          hidden: (item) => item.id === 2,
        },
      ];
      renderTabela({ actions });

      expect(screen.getAllByTitle("Excluir")).toHaveLength(2);
      const linhaBruno = screen.getByText("Bruno").closest("tr")!;
      expect(
        within(linhaBruno).queryByTitle("Excluir"),
      ).not.toBeInTheDocument();
    });

    it("sem ações não cria a coluna de ações", () => {
      renderTabela({ actions: [] });

      expect(screen.queryByText("Ações")).not.toBeInTheDocument();
    });
  });
});
