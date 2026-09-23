import { api } from "../api";
import type { Cliente, ClienteRequest } from "../../types/cliente/cliente";

export interface ClientePage {
  content: Cliente[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function listarClientes(
  page = 0,
  size = 20,
): Promise<ClientePage> {
  return api<ClientePage>(`/clientes?page=${page}&size=${size}&sort=nome`);
}

export async function buscarClientePorId(id: number): Promise<Cliente> {
  return api<Cliente>(`/clientes/${id}`);
}

export async function buscarClientesPorNome(nome: string): Promise<Cliente[]> {
  return api<Cliente[]>(`/clientes/nome/${encodeURIComponent(nome)}`);
}

export async function buscarClientePorDocumento(
  documento: string,
): Promise<Cliente> {
  return api<Cliente>(`/clientes/documento/${encodeURIComponent(documento)}`);
}

export async function criarCliente(data: ClienteRequest): Promise<Cliente> {
  return api<Cliente>("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarCliente(
  id: number,
  data: ClienteRequest,
): Promise<Cliente> {
  return api<Cliente>(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarCliente(id: number): Promise<void> {
  await api<void>(`/clientes/${id}`, {
    method: "DELETE",
  });
}
