import { api } from "./api";
import type { Oficina } from "../types/oficina/oficina";
import type { EntityOption } from "../components/EntityForm/types";
import { formatDocument } from "../utils/formatters";

export interface OficinaRequest {
  nome: string;
  cnpj: string;
  telefone: string;
}

export interface OficinaPage {
  content: Oficina[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function listarOficinas(): Promise<Oficina[]> {
  return api<Oficina[]>("/oficinas");
}

/**
 * Remove separadores de CNPJ (. - /) do termo de busca, sem afetar buscas
 * por nome. O CNPJ é armazenado sem formatação no backend, então
 * "12.345.678/0001-90" precisa virar "12345678000190" para casar com o
 * dado salvo — enquanto "Oficina São João" segue intacto.
 */
function sanitizeSearchTerm(value: string): string {
  return value.replace(/[.\-/]/g, "").trim();
}

export async function buscarOficinas(
  search: string,
  page = 0,
  size = 10,
): Promise<OficinaPage> {
  const termo = sanitizeSearchTerm(search);
  const params = new URLSearchParams({
    search: termo,
    page: String(page),
    size: String(size),
  });

  return api<OficinaPage>(`/oficinas/buscar?${params.toString()}`);
}

export async function buscarOficinasAutocomplete(
  search: string,
): Promise<EntityOption[]> {
  const pagina = await buscarOficinas(search, 0, 10);

  return pagina.content.map((oficina) => ({
    id: oficina.id,
    label: oficina.nome,
    description: `CNPJ: ${formatDocument(oficina.cnpj).display}`,
  }));
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
