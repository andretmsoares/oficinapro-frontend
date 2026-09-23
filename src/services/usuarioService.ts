import { api } from "./api";
import type { Usuario } from "../types/usuario/usuario";
import type { Role } from "../types/usuario/role";

export interface UsuarioPage {
  content: Usuario[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UsuarioRequest {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  password: string;
  role: Role;
  oficinaId: number | null;
}

export interface UsuarioUpdateRequest {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  password?: string;
  role: Role;
  oficinaId: number | null;
}

export interface UsuarioMeUpdateRequest {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  password?: string;
}

export async function listarUsuarios(
  page = 0,
  size = 20,
): Promise<UsuarioPage> {
  return api<UsuarioPage>(`/usuarios?page=${page}&size=${size}&sort=nome,asc`);
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  return api<Usuario>(`/usuarios/${id}`);
}

export async function criarUsuario(data: UsuarioRequest): Promise<Usuario> {
  return api<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarUsuario(
  id: number,
  data: UsuarioUpdateRequest,
): Promise<Usuario> {
  return api<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarUsuario(id: number): Promise<void> {
  await api<void>(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

export async function atualizarUsuarioLogado(
  data: UsuarioMeUpdateRequest,
): Promise<Usuario> {
  return api<Usuario>("/usuarios/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
