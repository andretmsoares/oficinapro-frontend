import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Veiculos } from "../../src/pages/Veiculos";
import type { Veiculo } from "../../src/types/veiculo/veiculo";
import { API, gerente, mecanico, pagina } from "../mocks/factories";
import { server } from "../mocks/server";
import { renderComRota } from "../helpers/render";

const civic: Veiculo = {
  id: 1,
  placa: "ABC1234",
  marca: "HONDA",
  modelo: "CIVIC",
  ano: 2020,
  cor: "AZUL",
};

function listar(veiculos: Veiculo[]) {
  const consultas: URLSearchParams[] = [];
  server.use(
    http.get(`${API}/veiculos/buscar`, ({ request }) => {
      consultas.push(new URL(request.url).searchParams);
      return HttpResponse.json(pagina(veiculos, veiculos.length ? 1 : 0));
    }),
  );
  return consultas;
}

describe("Página de Veículos", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("lista os veículos com placa formatada e mostra o total", async () => {
    listar([civic]);

    renderComRota(<Veiculos usuarioLogado={gerente()} />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    const linha = (await screen.findByText("ABC-1234")).closest("tr")!;
    expect(within(linha).getByText("#0001")).toBeInTheDocument();
    expect(within(linha).getByText("HONDA")).toBeInTheDocument();
    expect(within(linha).getByText("CIVIC")).toBeInTheDocument();
    expect(within(linha).getByText("2020")).toBeInTheDocument();
    expect(
      screen.getByText("Total de Veículos").closest(".stat-card"),
    ).toHaveTextContent("1");
  });

  it("sem veículos mostra o estado vazio", async () => {
    listar([]);

    renderComRota(<Veiculos usuarioLogado={gerente()} />);

    expect(
      await screen.findByText("Nenhum veículo cadastrado"),
    ).toBeInTheDocument();
  });

  it("busca no servidor por modelo, placa ou marca", async () => {
    const user = userEvent.setup();
    const consultas = listar([civic]);
    renderComRota(<Veiculos usuarioLogado={gerente()} />);
    await screen.findByText("ABC-1234");

    await user.type(
      screen.getByPlaceholderText(/Buscar veículo por Modelo, Placa ou Marca/),
      "civ",
    );

    await waitFor(() => expect(consultas.at(-1)?.get("q")).toBe("civ"));
    expect(screen.getByText("Encontrados na busca")).toBeInTheDocument();
  });

  it("GERENTE cadastra/edita/exclui; MECANICO só consulta", async () => {
    listar([civic]);
    const { unmount } = renderComRota(<Veiculos usuarioLogado={gerente()} />);
    await screen.findByText("ABC-1234");
    expect(
      screen.getByRole("button", { name: /Novo Veículo/ }),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Editar veículo")).toBeInTheDocument();
    expect(screen.getByTitle("Excluir veículo")).toBeInTheDocument();
    unmount();

    renderComRota(<Veiculos usuarioLogado={mecanico()} />);
    await screen.findByText("ABC-1234");
    expect(
      screen.queryByRole("button", { name: /Novo Veículo/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle("Editar veículo")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Excluir veículo")).not.toBeInTheDocument();
    expect(
      screen.getByTitle("Visualizar Ordens de Serviço"),
    ).toBeInTheDocument();
  });

  it("'Visualizar Ordens de Serviço' navega para /ordens-servico?veiculo=<placa>", async () => {
    const user = userEvent.setup();
    listar([civic]);
    renderComRota(<Veiculos usuarioLogado={gerente()} />, "/veiculos");
    await screen.findByText("ABC-1234");

    await user.click(screen.getByTitle("Visualizar Ordens de Serviço"));

    expect(screen.getByTestId("localizacao")).toHaveTextContent(
      "/ordens-servico?veiculo=ABC1234",
    );
  });

  describe("cadastro", () => {
    async function abrir() {
      const user = userEvent.setup();
      renderComRota(<Veiculos usuarioLogado={gerente()} />);
      await screen.findByText("ABC-1234");
      await user.click(screen.getByRole("button", { name: /Novo Veículo/ }));
      return user;
    }

    it("todos os campos são obrigatórios", async () => {
      listar([civic]);
      let posts = 0;
      server.use(
        http.post(`${API}/veiculos`, () => {
          posts++;
          return HttpResponse.json(civic, { status: 201 });
        }),
      );
      const user = await abrir();

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      for (const campo of ["Placa", "Marca", "Modelo", "Cor", "Ano"]) {
        expect(
          screen.getByText(`${campo} é obrigatório`),
          campo,
        ).toBeInTheDocument();
      }
      expect(posts).toBe(0);
    });

    it("envia a placa normalizada (sem hífen, em caixa alta) e o ano numérico", async () => {
      let corpo: unknown;
      listar([civic]);
      server.use(
        http.post(`${API}/veiculos`, async ({ request }) => {
          corpo = await request.json();
          return HttpResponse.json({ ...civic, id: 2 }, { status: 201 });
        }),
      );
      const user = await abrir();

      await user.type(
        screen.getByPlaceholderText(/placa do veículo/),
        "xyz1d23",
      );
      await user.type(screen.getByPlaceholderText(/marca do veículo/), "FIAT");
      await user.type(screen.getByPlaceholderText(/modelo do veículo/), "UNO");
      await user.type(screen.getByPlaceholderText(/cor do veículo/), "PRETO");
      await user.type(screen.getByPlaceholderText(/ano de fabricação/), "2018");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await screen.findByText("ABC-1234");
      expect(corpo).toEqual({
        placa: "XYZ1D23",
        marca: "FIAT",
        modelo: "UNO",
        ano: 2018,
        cor: "PRETO",
      });
    });

    it("placa duplicada (409) aparece no formulário", async () => {
      listar([civic]);
      server.use(
        http.post(`${API}/veiculos`, () =>
          HttpResponse.json(
            {
              message:
                "Já existe um veículo com a placa 'ABC1234' nesta oficina",
            },
            { status: 409 },
          ),
        ),
      );
      const user = await abrir();

      await user.type(
        screen.getByPlaceholderText(/placa do veículo/),
        "abc1234",
      );
      await user.type(screen.getByPlaceholderText(/marca do veículo/), "HONDA");
      await user.type(
        screen.getByPlaceholderText(/modelo do veículo/),
        "CIVIC",
      );
      await user.type(screen.getByPlaceholderText(/cor do veículo/), "AZUL");
      await user.type(screen.getByPlaceholderText(/ano de fabricação/), "2020");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText(/Já existe um veículo com a placa/),
      ).toBeInTheDocument();
    });
  });

  it("excluir pede confirmação e remove o veículo da lista", async () => {
    let veiculos = [civic];
    const excluidos: string[] = [];
    server.use(
      http.get(`${API}/veiculos/buscar`, () =>
        HttpResponse.json(pagina(veiculos)),
      ),
      http.delete(`${API}/veiculos/:id`, ({ params }) => {
        excluidos.push(String(params.id));
        veiculos = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderComRota(<Veiculos usuarioLogado={gerente()} />);
    await screen.findByText("ABC-1234");

    await user.click(screen.getByTitle("Excluir veículo"));
    await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

    expect(
      await screen.findByText("Nenhum veículo cadastrado"),
    ).toBeInTheDocument();
    expect(excluidos).toEqual(["1"]);
  });
});
