import { api } from "./api";
import type { ItemOsPeca } from "../types/itemOsPeca/itemOsPeca";

export interface ItemOsPecaRequest {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  osId: number;
}

export interface ItemOsPecaUpdateRequest {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export async function listarItemOsPecaPorOs(
  osId: number,
): Promise<ItemOsPeca[]> {
  return api<ItemOsPeca[]>(`/itens-os-peca/os/${osId}`);
}

export interface ItemOsPecaPage {
  content: ItemOsPeca[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Uma página das peças da oficina. A busca (nome ou parte do número da OS) roda no servidor sobre
 * TODAS as peças. `avulsas` restringe às peças sem OS (as que podem ser vinculadas).
 */
export async function listarItemOsPecasPaginado(
  termo: string,
  page = 0,
  size = 20,
  avulsas = false,
): Promise<ItemOsPecaPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (termo.trim()) {
    params.set("q", termo.trim());
  }

  if (avulsas) {
    params.set("avulsas", "true");
  }

  return api<ItemOsPecaPage>(`/itens-os-peca?${params.toString()}`);
}

export async function buscarItemOsPecaPorId(id: number): Promise<ItemOsPeca> {
  return api<ItemOsPeca>(`/itens-os-peca/${id}`);
}

export async function criarItemOsPeca(
  data: ItemOsPecaRequest,
): Promise<ItemOsPeca> {
  return api<ItemOsPeca>("/itens-os-peca", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarItemOsPeca(
  id: number,
  data: ItemOsPecaUpdateRequest,
): Promise<ItemOsPeca> {
  return api<ItemOsPeca>(`/itens-os-peca/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarItemOsPeca(id: number): Promise<void> {
  await api<void>(`/itens-os-peca/${id}`, {
    method: "DELETE",
  });
}

export async function vincularItemOsPecaOs(
  id: number,
  osId: number,
): Promise<ItemOsPeca> {
  return api<ItemOsPeca>(`/itens-os-peca/${id}/os/${osId}`, {
    method: "PUT",
  });
}

export async function desvincularItemOsPecaOs(id: number): Promise<ItemOsPeca> {
  return api<ItemOsPeca>(`/itens-os-peca/${id}/os`, {
    method: "DELETE",
  });
}
