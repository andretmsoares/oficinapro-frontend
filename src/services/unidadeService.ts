import { api } from "./api";
import type { Unidade, UnidadeRequest } from "../types/unidade/unidade";
import type { EntityOption } from "../components/EntityForm/types";

export async function buscarUnidadesAutocomplete(
  search: string,
): Promise<EntityOption[]> {
  const termo = search.trim().toUpperCase();

  if (!termo) {
    return [];
  }

  const unidades = await listarUnidades();

  const resultado = unidades
    .filter((unidade) => unidade.nome.toUpperCase().includes(termo))
    .slice(0, 10)
    .map((unidade) => ({
      id: unidade.id,
      label: unidade.nome,
      description: unidade.endereco || undefined,
    }));

  return resultado;
}

export async function buscarUnidadeAutocompletePorId(
  id: number,
): Promise<EntityOption | null> {
  try {
    const unidade = await buscarUnidadePorId(id);

    return {
      id: unidade.id,
      label: unidade.nome,
      description: unidade.endereco,
    };
  } catch {
    return null;
  }
}

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
