import { http, HttpResponse } from "msw";

import type { Usuario } from "../../src/types/usuario/usuario";
import { API, pagina } from "../mocks/factories";
import { server } from "../mocks/server";

export const TOKEN = "jwt-de-teste";

/** Rotas que as telas iniciais de cada papel consultam ao montar (todas vazias). */
export function handlersVazios() {
  return [
    http.get(`${API}/dashboard/data`, () =>
      HttpResponse.json({
        ordensAbertas: 0,
        veiculosCadastrados: 0,
        clientesCadastrados: 0,
        aReceber: 0,
        pagamentosPendentes: 0,
      }),
    ),
    http.get(`${API}/ordens-servico`, () => HttpResponse.json([])),
    http.get(`${API}/ordens-servico/fluxo-mensal`, () => HttpResponse.json([])),
    http.get(`${API}/clientes/buscar`, () => HttpResponse.json(pagina([]))),
    http.get(`${API}/oficinas/buscar`, () => HttpResponse.json(pagina([]))),
  ];
}

/** Simula um navegador com sessão salva: token no localStorage e /auth/me válido. */
export function sessaoComo(usuario: Usuario) {
  localStorage.setItem("accessToken", TOKEN);
  server.use(
    http.get(`${API}/auth/me`, () => HttpResponse.json(usuario)),
    ...handlersVazios(),
  );
}
