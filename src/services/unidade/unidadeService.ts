import { api } from "../api";
import type { Unidade, UnidadeRequest } from "../../types/unidade/unidade";

export async function listarUnidades(): Promise<Unidade[]> {
  return api<Unidade[]>("/unidades");
}

export async function buscarUnidadePorId(id: number): Promise<Unidade> {
  return api<Unidade>(`/unidades/${id}`);
}

export async function criarUnidade(
  oficinaId: number,
  data: UnidadeRequest,
): Promise<Unidade> {
  return api<Unidade>(`/unidades/oficina/${oficinaId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarUnidade(
  id: number,
  data: UnidadeRequest,
): Promise<Unidade> {
  return api<Unidade>(`/unidades/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarUnidade(id: number): Promise<void> {
  await api<void>(`/unidades/${id}`, {
    method: "DELETE",
  });
}
