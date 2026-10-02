import { http, HttpResponse } from "msw";

import { listarItemOsPecasPaginado } from "../../src/services/itemOsPecaService";
import {
  listarOrdensRecentes,
  listarOrdensServicoPaginado,
} from "../../src/services/ordemDeServicoService";
import {
  buscarPagamentosPaginado,
  buscarPagamentosPorOsIds,
  buscarResumoPagamentos,
} from "../../src/services/pagamentoService";
import { API, ordemDeServico, pagina } from "../mocks/factories";
import { server } from "../mocks/server";

/** Registra os parâmetros de cada GET na rota e responde com uma página vazia. */
function espiar(rota: string) {
  const chamadas: URLSearchParams[] = [];
  server.use(
    http.get(`${API}${rota}`, ({ request }) => {
      chamadas.push(new URL(request.url).searchParams);
      return HttpResponse.json(pagina([]));
    }),
  );
  return chamadas;
}

describe("OS paginadas", () => {
  it("envia página, tamanho, busca e status; sem busca/status não manda q nem status", async () => {
    const chamadas = espiar("/ordens-servico");

    await listarOrdensServicoPaginado("  abc-1234 ", "ABERTA", 2, 10);
    await listarOrdensServicoPaginado("   ", "", 0);

    expect(chamadas[0].get("q")).toBe("abc-1234");
    expect(chamadas[0].get("status")).toBe("ABERTA");
    expect(chamadas[0].get("page")).toBe("2");
    expect(chamadas[0].get("size")).toBe("10");
    expect(chamadas[1].has("q")).toBe(false);
    expect(chamadas[1].has("status")).toBe(false);
    expect(chamadas[1].get("size")).toBe("20");
  });

  it("listarOrdensRecentes pede só 5 OS, mais novas primeiro, e devolve o conteúdo", async () => {
    const chamadas: URLSearchParams[] = [];
    server.use(
      http.get(`${API}/ordens-servico`, ({ request }) => {
        chamadas.push(new URL(request.url).searchParams);
        return HttpResponse.json(pagina([ordemDeServico()]));
      }),
    );

    const recentes = await listarOrdensRecentes();

    expect(recentes).toHaveLength(1);
    expect(chamadas[0].get("size")).toBe("5");
    expect(chamadas[0].get("sort")).toBe("dataAbertura,desc");
  });
});

describe("pagamentos paginados", () => {
  it("envia a oficina, a busca (nº da OS), o status e a página", async () => {
    const chamadas = espiar("/pagamentos/oficina/7");

    await buscarPagamentosPaginado(7, " 12 ", "PAGA", 1);
    await buscarPagamentosPaginado(7, "", "");

    expect(chamadas[0].get("q")).toBe("12");
    expect(chamadas[0].get("status")).toBe("PAGA");
    expect(chamadas[0].get("page")).toBe("1");
    expect(chamadas[1].has("q")).toBe(false);
    expect(chamadas[1].has("status")).toBe(false);
  });

  it("resumo vem do servidor (totais não dependem da página)", async () => {
    server.use(
      http.get(`${API}/pagamentos/oficina/7/resumo`, () =>
        HttpResponse.json({
          totalRecebido: 90000,
          valorAReceber: 30000,
          pendentes: 4,
        }),
      ),
    );

    await expect(buscarResumoPagamentos(7)).resolves.toEqual({
      totalRecebido: 90000,
      valorAReceber: 30000,
      pendentes: 4,
    });
  });

  it("pagamentos por OS: manda só os ids pedidos, e lista vazia nem chama o servidor", async () => {
    let osIds: string | null = null;
    let chamadas = 0;
    server.use(
      http.get(`${API}/pagamentos/oficina/7/por-os`, ({ request }) => {
        chamadas++;
        osIds = new URL(request.url).searchParams.get("osIds");
        return HttpResponse.json([]);
      }),
    );

    await buscarPagamentosPorOsIds(7, [3, 5, 8]);
    expect(osIds).toBe("3,5,8");

    await expect(buscarPagamentosPorOsIds(7, [])).resolves.toEqual([]);
    expect(chamadas).toBe(1);
  });
});

describe("peças paginadas", () => {
  it("envia busca, página, tamanho e o filtro de avulsas só quando pedido", async () => {
    const chamadas = espiar("/itens-os-peca");

    await listarItemOsPecasPaginado(" filtro ", 3, 10, true);
    await listarItemOsPecasPaginado("");

    expect(chamadas[0].get("q")).toBe("filtro");
    expect(chamadas[0].get("page")).toBe("3");
    expect(chamadas[0].get("size")).toBe("10");
    expect(chamadas[0].get("avulsas")).toBe("true");
    expect(chamadas[1].has("q")).toBe(false);
    expect(chamadas[1].has("avulsas")).toBe(false);
  });
});
