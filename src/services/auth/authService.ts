import type { Usuario } from "../../types/usuario/usuario";

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: Usuario;
}

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
