import { api } from "./api";
import type { MaoObra, MaoObraRequest } from "../types/maoObra/maoObra";

export async function listarMaoObraPorOrdemServico(
  osId: number,
): Promise<MaoObra[]> {
  return api<MaoObra[]>(`/mao-obra/os/${osId}`);
}

export async function buscarMaoObra(id: number): Promise<MaoObra> {
  return api<MaoObra>(`/mao-obra/${id}`);
}

export async function criarMaoObra(data: MaoObraRequest): Promise<MaoObra> {
  return api<MaoObra>("/mao-obra", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarMaoObra(
  id: number,
  data: MaoObraRequest,
): Promise<MaoObra> {
  return api<MaoObra>(`/mao-obra/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarMaoObra(id: number): Promise<void> {
  await api<void>(`/mao-obra/${id}`, {
    method: "DELETE",
  });
}
