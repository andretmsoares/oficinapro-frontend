import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Pecas } from "../../src/pages/Pecas";
import type { ItemOsPeca } from "../../src/types/itemOsPeca/itemOsPeca";
import { API, pagina } from "../mocks/factories";
import { server } from "../mocks/server";

function peca(i: number, osId: number | null = null): ItemOsPeca {
  return {
    id: i,
    osId,
    nome: `PECA ${String(i).padStart(2, "0")}`,
    quantidade: 1,
    valorUnitario: 10000,
    valorTotal: 10000,
  };
}

/** Servidor falso: busca (nome ou nº da OS) e paginação aplicadas sobre TODAS as peças. */
function servidor(pecas: ItemOsPeca[]) {
  const consultas: URLSearchParams[] = [];

  server.use(
    http.get(`${API}/itens-os-peca`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      consultas.push(params);

      const q = (params.get("q") ?? "").trim().toLowerCase();
      const size = Number(params.get("size") ?? 20);
      const page = Number(params.get("page") ?? 0);
      const filtradas = pecas.filter(
        (p) =>
          !q ||
          p.nome.toLowerCase().includes(q) ||
          String(p.osId ?? "").includes(q),
      );

      return HttpResponse.json({
        ...pagina(
          filtradas.slice(page * size, (page + 1) * size),
          Math.max(1, Math.ceil(filtradas.length / size)),
        ),
        totalElements: filtradas.length,
        number: page,
      });
    }),
  );

  return consultas;
}

function renderizar() {
  const user = userEvent.setup();
  render(<Pecas />);
  return user;
}

describe("Página de Peças", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("mostra a primeira página, o total da oficina e a situação de cada peça", async () => {
    const todas = Array.from({ length: 25 }, (_, i) =>
      peca(i + 1, i === 0 ? 7 : null),
    );
    servidor(todas);

    renderizar();

    expect(await screen.findByText("PECA 01")).toBeInTheDocument();
    expect(screen.queryByText("PECA 21")).not.toBeInTheDocument();
    // o cartão mostra o total da base (25), não o tamanho da página (20)
    expect(
      screen.getByText("Peças Cadastradas").closest(".stat-card"),
    ).toHaveTextContent("25");
    expect(screen.getByText(/página 1 de 2/)).toBeInTheDocument();
    expect(
      within(screen.getByText("PECA 01").closest("tr")!).getByText("#7"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText("PECA 02").closest("tr")!).getByText(
        "Não vinculada",
      ),
    ).toBeInTheDocument();
  });

  it("a busca roda no servidor: acha a peça que não estava na página carregada", async () => {
    const todas = Array.from({ length: 25 }, (_, i) => peca(i + 1));
    const consultas = servidor(todas);
    const user = renderizar();
    await screen.findByText("PECA 01");
    expect(screen.queryByText("PECA 25")).not.toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Pesquisar por nome ou ID da OS"),
      "peca 25",
    );

    expect(await screen.findByText("PECA 25")).toBeInTheDocument();
    expect(screen.queryByText("PECA 01")).not.toBeInTheDocument();
    expect(consultas.at(-1)?.get("q")).toBe("peca 25");
  });

  it("busca também pelo número da OS", async () => {
    const todas = [peca(1), peca(2, 42), peca(3)];
    servidor(todas);
    const user = renderizar();
    await screen.findByText("PECA 01");

    await user.type(
      screen.getByPlaceholderText("Pesquisar por nome ou ID da OS"),
      "42",
    );

    await waitFor(() =>
      expect(screen.queryByText("PECA 01")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("PECA 02")).toBeInTheDocument();
  });

  it("'Próxima' pede a página seguinte ao servidor", async () => {
    const todas = Array.from({ length: 25 }, (_, i) => peca(i + 1));
    const consultas = servidor(todas);
    const user = renderizar();
    await screen.findByText("PECA 01");

    await user.click(screen.getByRole("button", { name: /Próxima/ }));

    expect(await screen.findByText("PECA 21")).toBeInTheDocument();
    expect(screen.queryByText("PECA 01")).not.toBeInTheDocument();
    expect(consultas.at(-1)?.get("page")).toBe("1");
  });

  it("busca sem resultado mostra a mensagem própria", async () => {
    servidor([peca(1)]);
    const user = renderizar();
    await screen.findByText("PECA 01");

    await user.type(
      screen.getByPlaceholderText("Pesquisar por nome ou ID da OS"),
      "inexistente",
    );

    expect(
      await screen.findByText("Nenhuma peça encontrada para a busca"),
    ).toBeInTheDocument();
  });

  it("sem peças mostra o estado vazio", async () => {
    servidor([]);

    renderizar();

    expect(
      await screen.findByText("Nenhuma peça cadastrada"),
    ).toBeInTheDocument();
  });
});
