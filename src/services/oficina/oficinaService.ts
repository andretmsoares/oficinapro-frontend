import { api } from "../api";
import type { Oficina } from "../../types/oficina/oficina";

export interface OficinaRequest {
  nome: string;
  cnpj: string;
  telefone: string;
}

export async function listarOficinas(): Promise<Oficina[]> {
  return api<Oficina[]>("/oficinas");
}

export async function buscarOficinaPorId(id: number): Promise<Oficina> {
  return api<Oficina>(`/oficinas/${id}`);
}

export async function criarOficina(data: OficinaRequest): Promise<Oficina> {
  return api<Oficina>("/oficinas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarOficina(
  id: number,
  data: OficinaRequest,
): Promise<Oficina> {
  return api<Oficina>(`/oficinas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarOficina(id: number): Promise<void> {
  await api<void>(`/oficinas/${id}`, {
    method: "DELETE",
  });
}

export async function ativarOficina(id: number): Promise<void> {
  await api<void>(`/oficinas/${id}/ativar`, {
    method: "PATCH",
  });
}

export async function desativarOficina(id: number): Promise<void> {
  await api<void>(`/oficinas/${id}/desativar`, {
    method: "PATCH",
  });
}
