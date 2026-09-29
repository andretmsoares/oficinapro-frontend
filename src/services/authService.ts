import type { Usuario } from "../types/usuario/usuario";
import type { LoginRequest, LoginResponse } from "../types/auth/auth";

const API_URL = import.meta.env.VITE_API_URL;


export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Usuário ou senha inválidos.");
    }

    if (response.status === 423 || response.status === 429) {
      const body = await response.json().catch(() => null);
      throw new Error(
        body?.message ??
          "Login bloqueado por excesso de tentativas. Fale com o administrador do sistema.",
      );
    }

    throw new Error("Não foi possível realizar o login.");
  }

  return response.json();
}

export async function buscarUsuarioLogado(token: string): Promise<Usuario> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Sessão inválida ou expirada.");
  }

  return response.json();
}
