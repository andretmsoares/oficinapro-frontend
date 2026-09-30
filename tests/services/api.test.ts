import { http, HttpResponse } from "msw";

import { ApiError, UNAUTHORIZED_EVENT, api } from "../../src/services/api";
import { server } from "../mocks/server";
import { API } from "../mocks/factories";

async function erroDe(chamada: Promise<unknown>): Promise<ApiError> {
  try {
    await chamada;
  } catch (erro) {
    return erro as ApiError;
  }
  throw new Error("a chamada deveria ter falhado");
}

describe("api()", () => {
  describe("cabeçalhos", () => {
    it("envia Authorization: Bearer quando há token salvo", async () => {
      localStorage.setItem("accessToken", "jwt-123");
      let authorization: string | null = null;
      server.use(
        http.get(`${API}/ping`, ({ request }) => {
          authorization = request.headers.get("Authorization");
          return HttpResponse.json({ ok: true });
        }),
      );

      await api("/ping");

      expect(authorization).toBe("Bearer jwt-123");
    });

    it("não envia Authorization sem token", async () => {
      let authorization: string | null = "inicial";
      server.use(
        http.get(`${API}/ping`, ({ request }) => {
          authorization = request.headers.get("Authorization");
          return HttpResponse.json({});
        }),
      );

      await api("/ping");

      expect(authorization).toBeNull();
    });

    it("usa Content-Type JSON por padrão", async () => {
      let contentType: string | null = null;
      server.use(
        http.post(`${API}/itens`, ({ request }) => {
          contentType = request.headers.get("Content-Type");
          return HttpResponse.json({});
        }),
      );

      await api("/itens", { method: "POST", body: JSON.stringify({ a: 1 }) });

      expect(contentType).toBe("application/json");
    });

    it("não força JSON em upload (FormData), para o navegador definir o boundary", async () => {
      // O FormData do jsdom não é aceito pelo fetch do Node; por isso o fetch é espionado.
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 204 }));
      const body = new FormData();
      body.append(
        "arquivo",
        new Blob(["x"], { type: "image/png" }),
        "logo.png",
      );

      await api("/logo", { method: "PUT", body });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(new Headers(init.headers).get("Content-Type")).toBeNull();
      expect(init.body).toBe(body);
    });
  });

  describe("respostas de sucesso", () => {
    it("devolve o JSON da resposta", async () => {
      server.use(http.get(`${API}/x`, () => HttpResponse.json({ id: 5 })));

      await expect(api<{ id: number }>("/x")).resolves.toEqual({ id: 5 });
    });

    it("devolve undefined em 204 (sem corpo)", async () => {
      server.use(
        http.delete(
          `${API}/x/1`,
          () => new HttpResponse(null, { status: 204 }),
        ),
      );

      await expect(api("/x/1", { method: "DELETE" })).resolves.toBeUndefined();
    });
  });

  describe("erros", () => {
    it("400 com campos: monta a mensagem e expõe fields no ApiError", async () => {
      server.use(
        http.post(`${API}/clientes`, () =>
          HttpResponse.json(
            {
              message: "Dados inválidos",
              fields: { nome: "Nome é obrigatório" },
            },
            { status: 400 },
          ),
        ),
      );

      const erro = await erroDe(api("/clientes", { method: "POST" }));

      expect(erro).toBeInstanceOf(ApiError);
      expect(erro.status).toBe(400);
      expect(erro.fields).toEqual({ nome: "Nome é obrigatório" });
      expect(erro.message).toBe("Dados inválidos (nome: Nome é obrigatório)");
    });

    it("usa 'detail' quando a resposta não tem 'message'", async () => {
      server.use(
        http.get(`${API}/x`, () =>
          HttpResponse.json({ detail: "Falha detalhada" }, { status: 409 }),
        ),
      );

      const erro = await erroDe(api("/x"));

      expect(erro.status).toBe(409);
      expect(erro.message).toBe("Falha detalhada");
    });

    it.each([403, 404, 500])(
      "%i sem corpo JSON usa mensagem padrão e preserva o status",
      async (status) => {
        server.use(
          http.get(`${API}/x`, () => new HttpResponse("<html/>", { status })),
        );

        const erro = await erroDe(api("/x"));

        expect(erro).toBeInstanceOf(ApiError);
        expect(erro.status).toBe(status);
        expect(erro.message).toBe("Erro ao realizar requisição.");
      },
    );

    it("401 com token: encerra a sessão e avisa a aplicação", async () => {
      localStorage.setItem("accessToken", "expirado");
      const aoExpirar = vi.fn();
      window.addEventListener(UNAUTHORIZED_EVENT, aoExpirar);
      server.use(
        http.get(`${API}/x`, () =>
          HttpResponse.json({ message: "Não autenticado" }, { status: 401 }),
        ),
      );

      const erro = await erroDe(api("/x"));
      window.removeEventListener(UNAUTHORIZED_EVENT, aoExpirar);

      expect(erro.status).toBe(401);
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(aoExpirar).toHaveBeenCalledTimes(1);
    });

    it("401 sem token não dispara o evento de sessão expirada", async () => {
      const aoExpirar = vi.fn();
      window.addEventListener(UNAUTHORIZED_EVENT, aoExpirar);
      server.use(
        http.get(`${API}/x`, () => new HttpResponse(null, { status: 401 })),
      );

      await api("/x").catch(() => undefined);
      window.removeEventListener(UNAUTHORIZED_EVENT, aoExpirar);

      expect(aoExpirar).not.toHaveBeenCalled();
    });

    it("403 com token não derruba a sessão", async () => {
      localStorage.setItem("accessToken", "valido");
      server.use(
        http.get(`${API}/x`, () => new HttpResponse(null, { status: 403 })),
      );

      await api("/x").catch(() => undefined);

      expect(localStorage.getItem("accessToken")).toBe("valido");
    });
  });
});
