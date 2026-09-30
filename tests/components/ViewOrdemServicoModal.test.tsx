import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { ViewOrdemServicoModal } from "../../src/components/ViewOrdemServicoModal";
import type { ItemOsPeca } from "../../src/types/itemOsPeca/itemOsPeca";
import type { MaoObra } from "../../src/types/maoObra/maoObra";
import type { OrdemDeServico } from "../../src/types/ordemDeServico/ordemDeServico";
import type { Usuario } from "../../src/types/usuario/usuario";
import {
  API,
  gerente,
  mecanico,
  ordemDeServico,
  pagamento,
} from "../mocks/factories";
import { server } from "../mocks/server";

const peca: ItemOsPeca = {
  id: 5,
  osId: 1,
  nome: "PASTILHA DE FREIO",
  quantidade: 2,
  valorUnitario: 12000,
  valorTotal: 24000,
};

const servico: MaoObra = {
  id: 9,
  osId: 1,
  valor: 8000,
  descricao: "TROCA DE PASTILHAS",
};

interface Estado {
  os: OrdemDeServico;
  pecas: ItemOsPeca[];
  maoDeObra: MaoObra[];
  pagamento: ReturnType<typeof pagamento>;
}

function backend(parcial: Partial<Estado> = {}): Estado {
  const estado: Estado = {
    os: ordemDeServico({ valorTotal: 32000, valorComDesconto: 32000 }),
    pecas: [peca],
    maoDeObra: [servico],
    pagamento: pagamento({ valorTotal: 32000, valorPendente: 32000 }),
    ...parcial,
  };
  server.use(
    http.get(`${API}/pagamentos/os/1`, () =>
      HttpResponse.json(estado.pagamento),
    ),
    http.get(`${API}/itens-os-peca/os/1`, () =>
      HttpResponse.json(estado.pecas),
    ),
    http.get(`${API}/mao-obra/os/1`, () => HttpResponse.json(estado.maoDeObra)),
    http.get(`${API}/ordens-servico/1`, () => HttpResponse.json(estado.os)),
  );
  return estado;
}

function abrir(usuario: Usuario = gerente(), os?: OrdemDeServico) {
  const props = {
    onClose: vi.fn(),
    onAddPeca: vi.fn(),
    onUpdatePeca: vi.fn(),
    onUpdateOrdemServico: vi.fn(),
  };
  const user = userEvent.setup();
  render(
    <ViewOrdemServicoModal
      usuarioLogado={usuario}
      ordemServico={
        os ?? ordemDeServico({ valorTotal: 32000, valorComDesconto: 32000 })
      }
      todasAsPecas={[]}
      {...props}
    />,
  );
  return { user, ...props };
}

const normalizado = (el: Element | null) =>
  el?.textContent?.replace(/\s/g, " ") ?? "";
const secao = (titulo: string) =>
  screen.getByRole("heading", { name: titulo }).closest("section")!;
/** Texto (rótulo + valor) do bloco de totais ou de pagamento que contém o rótulo. */
const valorDe = (rotulo: string) => {
  const rotuloEl = Array.from(
    document.querySelectorAll(".view-os-totals *, .view-os-payment *"),
  ).find((e) => e.children.length === 0 && e.textContent === rotulo);
  return normalizado(rotuloEl?.parentElement ?? null);
};

describe("ViewOrdemServicoModal", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("conteúdo", () => {
    it("mostra dados da OS, peças, mão de obra, resumo financeiro e pagamento", async () => {
      backend({
        pagamento: pagamento({
          valorTotal: 32000,
          valorPago: 10000,
          valorPendente: 22000,
          status: "PAGO_PARCIALMENTE",
        }),
      });

      abrir();

      expect(
        screen.getByRole("heading", { name: "Ordem de Serviço" }),
      ).toBeInTheDocument();
      expect(screen.getByText("OS #0001")).toBeInTheDocument();
      expect(screen.getByText("JOAO SILVA")).toBeInTheDocument();
      expect(screen.getByText("ABC1234")).toBeInTheDocument();
      expect(screen.getByText("Revisão geral")).toBeInTheDocument();

      expect(await screen.findByText("PASTILHA DE FREIO")).toBeInTheDocument();
      expect(
        normalizado(screen.getByText("PASTILHA DE FREIO").closest("tr")),
      ).toContain("R$ 240,00");
      expect(await screen.findByText("TROCA DE PASTILHAS")).toBeInTheDocument();
      expect(
        normalizado(screen.getByText("TROCA DE PASTILHAS").closest("tr")),
      ).toContain("R$ 80,00");

      expect(valorDe("Valor Total")).toContain("R$ 320,00");
      expect(valorDe("Desconto")).toContain("R$ 0,00");
      expect(valorDe("Valor com Desconto")).toContain("R$ 320,00");

      await screen.findByText("Saldo restante");
      const pagamentoSecao = secao("Pagamento");
      expect(valorDe("Valor recebido")).toContain("R$ 100,00");
      expect(normalizado(pagamentoSecao)).toContain("R$ 220,00");
    });

    it("OS sem peças nem mão de obra mostra mensagens de vazio", async () => {
      backend({ pecas: [], maoDeObra: [] });

      abrir();

      expect(
        await screen.findByText("Nenhuma peça adicionada a esta OS"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Nenhuma mão de obra adicionada a esta OS"),
      ).toBeInTheDocument();
    });

    it("falha ao carregar peças/mão de obra mostra o erro da API no lugar da tabela", async () => {
      backend();
      server.use(
        http.get(`${API}/itens-os-peca/os/1`, () =>
          HttpResponse.json({ message: "Sem permissão" }, { status: 403 }),
        ),
        http.get(`${API}/mao-obra/os/1`, () =>
          HttpResponse.json({ message: "Erro interno" }, { status: 500 }),
        ),
      );

      abrir();

      expect(await screen.findByText("Sem permissão")).toBeInTheDocument();
      expect(await screen.findByText("Erro interno")).toBeInTheDocument();
    });

    it("sem pagamento carregado, a seção de pagamento não aparece", async () => {
      backend();
      server.use(
        http.get(
          `${API}/pagamentos/os/1`,
          () => new HttpResponse(null, { status: 404 }),
        ),
      );

      abrir();
      await screen.findByText("PASTILHA DE FREIO");

      expect(
        screen.queryByRole("heading", { name: "Pagamento" }),
      ).not.toBeInTheDocument();
    });

    it("Fechar chama onClose", async () => {
      backend();
      const { user, onClose } = abrir();

      await user.click(screen.getByRole("button", { name: "Fechar" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("permissões", () => {
    it("GERENTE vê todas as ações de edição", async () => {
      backend();

      abrir(gerente());
      await screen.findByText("PASTILHA DE FREIO");
      await screen.findByText("TROCA DE PASTILHAS");
      await screen.findByRole("button", { name: /Registrar pagamento/i });

      for (const nome of [
        "Adicionar Peça",
        "Adicionar Mão de Obra",
        "Adicionar Desconto",
      ]) {
        expect(
          screen.getByRole("button", { name: new RegExp(nome) }),
          nome,
        ).toBeInTheDocument();
      }
      expect(screen.getByTitle("Desvincular peça")).toBeInTheDocument();
      expect(screen.getByTitle("Excluir mão de obra")).toBeInTheDocument();
    });

    it("MECANICO apenas visualiza: sem adicionar, desvincular, excluir, desconto ou pagamento", async () => {
      backend();

      abrir(mecanico());
      await screen.findByText("PASTILHA DE FREIO");
      await screen.findByText("TROCA DE PASTILHAS");
      await screen.findByText("Saldo restante");

      for (const nome of [
        /Adicionar Peça/,
        /Adicionar Mão de Obra/,
        /Adicionar Desconto/,
        /Registrar pagamento/i,
      ]) {
        expect(
          screen.queryByRole("button", { name: nome }),
          String(nome),
        ).not.toBeInTheDocument();
      }
      expect(screen.queryByTitle("Desvincular peça")).not.toBeInTheDocument();
      expect(
        screen.queryByTitle("Excluir mão de obra"),
      ).not.toBeInTheDocument();
    });

    it("OS já quitada não oferece 'Registrar pagamento' nem para o GERENTE", async () => {
      backend({
        pagamento: pagamento({
          valorTotal: 32000,
          valorPago: 32000,
          valorPendente: 0,
          status: "PAGA",
        }),
      });

      abrir(gerente());
      await screen.findByText("Saldo restante");

      expect(
        screen.queryByRole("button", { name: /Registrar pagamento/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("desconto", () => {
    it("aplica o desconto, mostra os novos valores e avisa a página", async () => {
      const estado = backend();
      let corpo: unknown;
      server.use(
        http.patch(`${API}/ordens-servico/1/desconto`, async ({ request }) => {
          corpo = await request.json();
          estado.os = ordemDeServico({
            valorTotal: 32000,
            desconto: 5000,
            valorComDesconto: 27000,
          });
          estado.pagamento = pagamento({
            valorTotal: 27000,
            valorPendente: 27000,
          });
          return HttpResponse.json(estado.os);
        }),
      );
      const { user, onUpdateOrdemServico } = abrir();
      await screen.findByText("Saldo restante");

      await user.click(
        screen.getByRole("button", { name: /Adicionar Desconto/ }),
      );
      expect(
        screen.getByRole("heading", {
          name: /Desconto - OS #0001 \(atual: R\$\s*0,00\)/,
        }),
      ).toBeInTheDocument();
      await user.clear(
        screen.getByPlaceholderText("Digite o desconto a ser aplicado"),
      );
      await user.type(
        screen.getByPlaceholderText("Digite o desconto a ser aplicado"),
        "5000",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() => expect(valorDe("Desconto")).toContain("R$ 50,00"));
      expect(corpo).toBe(5000);
      expect(valorDe("Valor com Desconto")).toContain("R$ 270,00");
      expect(onUpdateOrdemServico).toHaveBeenCalledWith(
        expect.objectContaining({ desconto: 5000 }),
      );
      expect(
        screen.queryByRole("heading", { name: /Desconto - OS/ }),
      ).not.toBeInTheDocument();
      // o pagamento é recarregado com o novo valor da OS
      await waitFor(() =>
        expect(normalizado(secao("Pagamento"))).toContain("R$ 270,00"),
      );
    });

    it("desconto recusado pelo backend mostra o erro no modal e mantém os valores", async () => {
      backend();
      server.use(
        http.patch(`${API}/ordens-servico/1/desconto`, () =>
          HttpResponse.json(
            { message: "Desconto nao pode ser maior que o valor total da OS" },
            { status: 400 },
          ),
        ),
      );
      const { user, onUpdateOrdemServico } = abrir();
      await screen.findByText("Saldo restante");

      await user.click(
        screen.getByRole("button", { name: /Adicionar Desconto/ }),
      );
      await user.type(
        screen.getByPlaceholderText("Digite o desconto a ser aplicado"),
        "9",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText(
          "Desconto nao pode ser maior que o valor total da OS",
        ),
      ).toBeInTheDocument();
      expect(valorDe("Desconto")).toContain("R$ 0,00");
      expect(onUpdateOrdemServico).not.toHaveBeenCalled();
    });
  });

  describe("mão de obra", () => {
    it("adiciona um serviço, recarrega os totais da OS e fecha o formulário", async () => {
      const estado = backend({ maoDeObra: [] });
      let corpo: unknown;
      server.use(
        http.post(`${API}/mao-obra`, async ({ request }) => {
          corpo = await request.json();
          const novo: MaoObra = {
            id: 50,
            osId: 1,
            valor: 15000,
            descricao: "TROCA DE OLEO",
          };
          estado.maoDeObra = [novo];
          estado.os = ordemDeServico({
            valorTotal: 47000,
            valorComDesconto: 47000,
          });
          return HttpResponse.json(novo, { status: 201 });
        }),
      );
      const { user, onUpdateOrdemServico } = abrir();
      await screen.findByText("Nenhuma mão de obra adicionada a esta OS");

      await user.click(
        screen.getByRole("button", { name: /Adicionar Mão de Obra/ }),
      );
      expect(
        screen.getByPlaceholderText("Digite o ID da ordem de serviço"),
      ).toHaveValue(1);
      await user.type(
        screen.getByPlaceholderText(/^Digite a descri.+ da m.o de obra$/i),
        "Troca de oleo",
      );
      await user.type(
        screen.getByPlaceholderText(/^Digite o valor da m.o de obra$/),
        "15000",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Troca de oleo".toUpperCase()),
      ).toBeInTheDocument();
      expect(corpo).toEqual({
        osId: 1,
        valor: 15000,
        descricao: "Troca de oleo",
      });
      await waitFor(() =>
        expect(valorDe("Valor Total")).toContain("R$ 470,00"),
      );
      expect(onUpdateOrdemServico).toHaveBeenCalledWith(
        expect.objectContaining({ valorTotal: 47000 }),
      );
      expect(
        screen.queryByRole("heading", { name: "Adicionar Mão de Obra" }),
      ).not.toBeInTheDocument();
    });

    it("descrição e valor são obrigatórios", async () => {
      backend({ maoDeObra: [] });
      let posts = 0;
      server.use(
        http.post(`${API}/mao-obra`, () => {
          posts++;
          return HttpResponse.json(servico, { status: 201 });
        }),
      );
      const { user } = abrir();
      await screen.findByText("Nenhuma mão de obra adicionada a esta OS");

      await user.click(
        screen.getByRole("button", { name: /Adicionar Mão de Obra/ }),
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(screen.getByText("Descrição é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Valor é obrigatório")).toBeInTheDocument();
      expect(posts).toBe(0);
    });

    it("OS finalizada/cancelada recusa a mão de obra: erro do backend aparece no modal", async () => {
      backend({ maoDeObra: [] });
      server.use(
        http.post(`${API}/mao-obra`, () =>
          HttpResponse.json(
            {
              message:
                "Uma Ordem de Serviço cancelada nao pode ter seu status alterado.",
            },
            { status: 422 },
          ),
        ),
      );
      const { user } = abrir();
      await screen.findByText("Nenhuma mão de obra adicionada a esta OS");

      await user.click(
        screen.getByRole("button", { name: /Adicionar Mão de Obra/ }),
      );
      await user.type(
        screen.getByPlaceholderText(/^Digite a descri.+ da m.o de obra$/i),
        "x",
      );
      await user.type(
        screen.getByPlaceholderText(/^Digite o valor da m.o de obra$/),
        "100",
      );
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findAllByText(/cancelada nao pode/)).not.toHaveLength(
        0,
      );
    });

    it("exclui o serviço após confirmação e recarrega os totais", async () => {
      const estado = backend();
      const removidos: string[] = [];
      server.use(
        http.delete(`${API}/mao-obra/:id`, ({ params }) => {
          removidos.push(String(params.id));
          estado.maoDeObra = [];
          estado.os = ordemDeServico({
            valorTotal: 24000,
            valorComDesconto: 24000,
          });
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user } = abrir();
      await screen.findByText("TROCA DE PASTILHAS");

      await user.click(screen.getByTitle("Excluir mão de obra"));
      expect(
        screen.getByRole("heading", { name: "Excluir Mão de obra" }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() =>
        expect(
          screen.queryByText("TROCA DE PASTILHAS"),
        ).not.toBeInTheDocument(),
      );
      expect(removidos).toEqual(["9"]);
      await waitFor(() =>
        expect(valorDe("Valor Total")).toContain("R$ 240,00"),
      );
    });
  });

  describe("peças", () => {
    it("desvincular pede confirmação, chama a API e remove a peça da tabela", async () => {
      const estado = backend();
      let chamadas = 0;
      server.use(
        http.delete(`${API}/itens-os-peca/5/os`, () => {
          chamadas++;
          estado.pecas = [];
          estado.os = ordemDeServico({
            valorTotal: 8000,
            valorComDesconto: 8000,
          });
          return HttpResponse.json({ ...peca, osId: null });
        }),
      );
      const { user, onUpdatePeca } = abrir();
      await screen.findByText("PASTILHA DE FREIO");

      await user.click(screen.getByTitle("Desvincular peça"));
      await user.click(screen.getByRole("button", { name: /^Excluir$/ }));

      await waitFor(() =>
        expect(screen.queryByText("PASTILHA DE FREIO")).not.toBeInTheDocument(),
      );
      expect(chamadas).toBe(1);
      expect(onUpdatePeca).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, osId: null }),
      );
      await waitFor(() => expect(valorDe("Valor Total")).toContain("R$ 80,00"));
    });

    it("'Adicionar Peça' oferece criar uma nova ou relacionar uma existente", async () => {
      backend();
      const { user } = abrir();
      await screen.findByText("PASTILHA DE FREIO");

      await user.click(screen.getByRole("button", { name: /Adicionar Peça/ }));

      expect(
        screen.getByText(/Como deseja adicionar uma peça à OS #0001/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Criar nova peça/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Relacionar peça existente/ }),
      ).toBeInTheDocument();
    });
  });

  describe("pagamento pela OS", () => {
    it("registra um pagamento parcial e atualiza valor recebido e saldo", async () => {
      const estado = backend();
      let corpo: unknown;
      server.use(
        http.post(`${API}/registros-pagamento`, async ({ request }) => {
          corpo = await request.json();
          estado.pagamento = pagamento({
            valorTotal: 32000,
            valorPago: 12000,
            valorPendente: 20000,
            status: "PAGO_PARCIALMENTE",
          });
          return HttpResponse.json(
            {
              id: 1,
              pagamentoId: 10,
              valor: 12000,
              meioPagamento: "PIX",
              data: "2026-02-10T10:00:00",
            },
            { status: 201 },
          );
        }),
      );
      const { user } = abrir();
      await user.click(
        await screen.findByRole("button", { name: /Registrar pagamento/i }),
      );

      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "12000",
      );
      await user.selectOptions(screen.getByRole("combobox"), "PIX");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      await waitFor(() =>
        expect(valorDe("Valor recebido")).toContain("R$ 120,00"),
      );
      expect(corpo).toEqual({
        pagamentoId: 10,
        valor: 12000,
        meioPagamento: "PIX",
      });
      expect(normalizado(secao("Pagamento"))).toContain("R$ 200,00");
    });

    it("valor acima do saldo é barrado no formulário, sem chamar a API", async () => {
      backend();
      let posts = 0;
      server.use(
        http.post(`${API}/registros-pagamento`, () => {
          posts++;
          return new HttpResponse(null, { status: 201 });
        }),
      );
      const { user } = abrir();
      await user.click(
        await screen.findByRole("button", { name: /Registrar pagamento/i }),
      );

      await user.type(
        screen.getByPlaceholderText("Digite o valor pago"),
        "32001",
      );
      await user.selectOptions(screen.getByRole("combobox"), "PIX");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(
        screen.getByText(/Valor máximo permitido: R\$\s*320,00/),
      ).toBeInTheDocument();
      expect(posts).toBe(0);
    });
  });

  it("mostra formulário do pagamento dentro do escopo da OS (saldo vem do pagamento)", async () => {
    backend({
      pagamento: pagamento({
        valorTotal: 32000,
        valorPago: 30000,
        valorPendente: 2000,
        status: "PAGO_PARCIALMENTE",
      }),
    });
    const { user } = abrir();
    await user.click(
      await screen.findByRole("button", { name: /Registrar pagamento/i }),
    );

    await user.type(screen.getByPlaceholderText("Digite o valor pago"), "2001");
    await user.selectOptions(screen.getByRole("combobox"), "DINHEIRO");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      within(document.body).getByText(/Valor máximo permitido: R\$\s*20,00/),
    ).toBeInTheDocument();
  });
});
