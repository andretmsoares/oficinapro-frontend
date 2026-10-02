import { http, HttpResponse } from "msw";

import { buscarClientePorDocumento } from "../../src/services/clienteService";
import { buscarMecanicoPorDocumento } from "../../src/services/mecanicoService";
import { server } from "../mocks/server";
import { API } from "../mocks/factories";

/**
 * CPF/CNPJ vai no CORPO de um POST, e não na URL: URLs ficam em logs de acesso, proxies e
 * histórico do navegador.
 */
describe("busca por documento", () => {
  it("cliente: POST com o documento no corpo, sem o documento na URL", async () => {
    let url = "";
    let metodo = "";
    let corpo: unknown;
    server.use(
      http.post(`${API}/clientes/documento/buscar`, async ({ request }) => {
        url = request.url;
        metodo = request.method;
        corpo = await request.json();
        return HttpResponse.json({
          id: 1,
          nome: "ANA",
          documento: "12345678901",
        });
      }),
    );

    const cliente = await buscarClientePorDocumento("12345678901");

    expect(metodo).toBe("POST");
    expect(corpo).toEqual({ documento: "12345678901" });
    expect(url).not.toContain("12345678901");
    expect(cliente.nome).toBe("ANA");
  });

  it("mecânico: POST com o documento no corpo, sem o documento na URL", async () => {
    let url = "";
    let corpo: unknown;
    server.use(
      http.post(`${API}/mecanicos/documento/buscar`, async ({ request }) => {
        url = request.url;
        corpo = await request.json();
        return HttpResponse.json({
          id: 2,
          nome: "JOÃO",
          documento: "98765432100",
        });
      }),
    );

    const mecanico = await buscarMecanicoPorDocumento("98765432100");

    expect(corpo).toEqual({ documento: "98765432100" });
    expect(url).not.toContain("98765432100");
    expect(mecanico.nome).toBe("JOÃO");
  });
});
