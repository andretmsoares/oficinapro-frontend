import { api } from "./api";
import type { Cliente, ClienteRequest } from "../types/cliente/cliente";
import type { EntityOption } from "../components/EntityForm/types";

export interface ClientePage {
  content: Cliente[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function buscarClientesAutocomplete(
  search: string,
): Promise<EntityOption[]> {
  const termo = search.trim();

  if (!termo) {
    return [];
  }

  try {
    const clientes = await buscarClientesPorNome(termo);

    return clientes.map((cliente) => ({
      id: cliente.id,
      label: cliente.nome,
      description: cliente.documento ? `CPF: ${cliente.documento}` : undefined,
    }));
  } catch {
    try {
      const cliente = await buscarClientePorDocumento(termo);

      return [
        {
          id: cliente.id,
          label: cliente.nome,
          description: cliente.documento
            ? `CPF: ${cliente.documento}`
            : undefined,
        },
      ];
    } catch {
      return [];
    }
  }
}

export async function buscarClienteAutocompletePorId(
  id: number,
): Promise<EntityOption | null> {
  try {
    const cliente = await buscarClientePorId(id);

    return {
      id: cliente.id,
      label: cliente.nome,
      description: cliente.documento ? `CPF: ${cliente.documento}` : undefined,
    };
  } catch {
    return null;
  }
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
