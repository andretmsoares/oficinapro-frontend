import { api } from "./api";
import type { Mecanico, MecanicoRequest } from "../types/mecanico/mecanico";
import type { EntityOption } from "../components/EntityForm/types";

export interface MecanicoPage {
  content: Mecanico[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function buscarMecanicosAutocomplete(
  search: string,
): Promise<EntityOption[]> {
  const termo = search.trim().toUpperCase();

  if (!termo) {
    return [];
  }

  try {
    const mecanicos = await buscarMecanicosPorNome(termo);

    return mecanicos.map((mecanico) => ({
      id: mecanico.id,
      label: mecanico.nome,
      description: mecanico.documento
        ? `CPF: ${mecanico.documento}`
        : undefined,
    }));
  } catch {
    try {
      const mecanico = await buscarMecanicoPorDocumento(termo);

      return [
        {
          id: mecanico.id,
          label: mecanico.nome,
          description: mecanico.documento
            ? `CPF: ${mecanico.documento}`
            : undefined,
        },
      ];
    } catch {
      return [];
    }
  }
}

export async function buscarMecanicoAutocompletePorId(
  id: number,
): Promise<EntityOption | null> {
  try {
    const mecanico = await buscarMecanicoPorId(id);

    return {
      id: mecanico.id,
      label: mecanico.nome,
      description: mecanico.documento
        ? `CPF: ${mecanico.documento}`
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function listarMecanicos(
  page = 0,
  size = 20,
): Promise<MecanicoPage> {
  return api<MecanicoPage>(`/mecanicos?page=${page}&size=${size}&sort=nome`);
}

export async function buscarMecanicoPorId(id: number): Promise<Mecanico> {
  return api<Mecanico>(`/mecanicos/${id}`);
}

export async function buscarMecanicosPorNome(
  nome: string,
): Promise<Mecanico[]> {
  return api<Mecanico[]>(`/mecanicos/nome/${encodeURIComponent(nome)}`);
}

export async function buscarMecanicoPorDocumento(
  documento: string,
): Promise<Mecanico> {
  return api<Mecanico>(`/mecanicos/documento/${encodeURIComponent(documento)}`);
}

export async function criarMecanico(data: MecanicoRequest): Promise<Mecanico> {
  return api<Mecanico>("/mecanicos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarMecanico(
  id: number,
  data: MecanicoRequest,
): Promise<Mecanico> {
  return api<Mecanico>(`/mecanicos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarMecanico(id: number): Promise<void> {
  await api<void>(`/mecanicos/${id}`, {
    method: "DELETE",
  });
}
