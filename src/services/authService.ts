import type { Usuario } from "../types/usuario/usuario";
import type { LoginRequest, LoginResponse } from "../types/auth/auth";

import { API_URL, trackedFetch } from "./api";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await trackedFetch(`${API_URL}/auth/login`, {
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

/**
 * Revoga no servidor todos os tokens do usuário. É "melhor esforço": quem chama já limpou a
 * sessão local, então uma falha de rede aqui não pode impedir a saída.
 */
export async function logout(token: string): Promise<void> {
  try {
    await trackedFetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Sem rede ou servidor fora: o token expira sozinho em até 8h.
  }
}

export async function buscarUsuarioLogado(token: string): Promise<Usuario> {
  const response = await trackedFetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Sessão inválida ou expirada.");
  }

  return response.json();
}
