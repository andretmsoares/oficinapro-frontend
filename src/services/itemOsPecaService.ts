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

export async function listarItemOsPecas(): Promise<ItemOsPeca[]> {
  return api<ItemOsPeca[]>("/itens-os-peca");
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
