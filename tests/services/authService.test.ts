import { http, HttpResponse } from "msw";

import {
  buscarUsuarioLogado,
  login,
  logout,
} from "../../src/services/authService";
import { server } from "../mocks/server";
import { API, gerente } from "../mocks/factories";

describe("login", () => {
  it("envia as credenciais e devolve token e usuário", async () => {
    let corpo: unknown;
    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({
          accessToken: "jwt-abc",
          tokenType: "Bearer",
          expiresIn: 28800,
          usuario: gerente(),
        });
      }),
    );

    const resposta = await login({ username: "ana", password: "senha1234" });

    expect(corpo).toEqual({ username: "ana", password: "senha1234" });
    expect(resposta.accessToken).toBe("jwt-abc");
    expect(resposta.usuario.role).toBe("GERENTE");
  });

  it("401 vira mensagem genérica de credenciais inválidas", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(
          { message: "Credenciais inválidas" },
          { status: 401 },
        ),
      ),
    );

    await expect(login({ username: "x", password: "y" })).rejects.toThrow(
      "Usuário ou senha inválidos.",
    );
  });

  it("423 (conta bloqueada) mostra a mensagem do servidor", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(
          { message: "Conta bloqueada. Fale com o administrador." },
          { status: 423 },
        ),
      ),
    );

    await expect(login({ username: "x", password: "y" })).rejects.toThrow(
      "Conta bloqueada. Fale com o administrador.",
    );
  });

  it("429 (bloqueio temporário) mostra a mensagem do servidor", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(
          { message: "Muitas tentativas. Tente em 5 minuto(s)." },
          { status: 429 },
        ),
      ),
    );

    await expect(login({ username: "x", password: "y" })).rejects.toThrow(
      "Muitas tentativas. Tente em 5 minuto(s).",
    );
  });

  it("429 sem corpo JSON usa a mensagem padrão de bloqueio", async () => {
    server.use(
      http.post(
        `${API}/auth/login`,
        () => new HttpResponse("", { status: 429 }),
      ),
    );

    await expect(login({ username: "x", password: "y" })).rejects.toThrow(
      /excesso de tentativas/,
    );
  });

  it("outros erros (500) viram mensagem genérica", async () => {
    server.use(
      http.post(
        `${API}/auth/login`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(login({ username: "x", password: "y" })).rejects.toThrow(
      "Não foi possível realizar o login.",
    );
  });
});

describe("buscarUsuarioLogado", () => {
  it("consulta /auth/me com o token informado", async () => {
    let authorization: string | null = null;
    server.use(
      http.get(`${API}/auth/me`, ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json(gerente());
      }),
    );

    const usuario = await buscarUsuarioLogado("jwt-abc");

    expect(authorization).toBe("Bearer jwt-abc");
    expect(usuario.username).toBe("ana.gerente");
  });

  it("token inválido/expirado lança erro de sessão", async () => {
    server.use(
      http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 401 })),
    );

    await expect(buscarUsuarioLogado("ruim")).rejects.toThrow(
      "Sessão inválida ou expirada.",
    );
  });
});

describe("logout", () => {
  it("chama POST /auth/logout com o Bearer para revogar os tokens no servidor", async () => {
    let metodo = "";
    let autorizacao: string | null = null;
    server.use(
      http.post(`${API}/auth/logout`, ({ request }) => {
        metodo = request.method;
        autorizacao = request.headers.get("Authorization");
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await logout("jwt-abc");

    expect(metodo).toBe("POST");
    expect(autorizacao).toBe("Bearer jwt-abc");
  });

  it("falha de rede não impede a saída (melhor esforço)", async () => {
    server.use(http.post(`${API}/auth/logout`, () => HttpResponse.error()));

    await expect(logout("jwt-abc")).resolves.toBeUndefined();
  });

  it("resposta de erro do servidor também não lança", async () => {
    server.use(
      http.post(
        `${API}/auth/logout`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(logout("jwt-velho")).resolves.toBeUndefined();
  });
});
