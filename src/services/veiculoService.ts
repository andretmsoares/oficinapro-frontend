import { api } from "./api";
import type { Veiculo } from "../types/veiculo/veiculo";
import type { EntityOption } from "../components/EntityForm/types";

export interface VeiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
}

export interface VeiculoPage {
  content: Veiculo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export async function buscarVeiculosAutocomplete(
  search: string,
): Promise<EntityOption[]> {
  const termo = search.trim().toUpperCase();

  if (!termo) {
    return [];
  }

  const pagina = await listarVeiculos();

  return pagina.content
    .filter((veiculo) => {
      const placa = veiculo.placa.toUpperCase();
      const marca = veiculo.marca.toUpperCase();
      const modelo = veiculo.modelo.toUpperCase();

      return (
        placa.includes(termo) || marca.includes(termo) || modelo.includes(termo)
      );
    })
    .slice(0, 10)
    .map((veiculo) => ({
      id: veiculo.id,
      label: veiculo.placa,
      description: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.ano}`,
    }));
}

export async function buscarVeiculoAutocompletePorId(
  id: number,
): Promise<EntityOption | null> {
  try {
    const veiculo = await buscarVeiculoPorId(id);

    return {
      id: veiculo.id,
      label: veiculo.placa,
      description: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.ano}`,
    };
  } catch {
    return null;
  }
}

export async function buscarVeiculoPorId(id: number): Promise<Veiculo> {
  return api<Veiculo>(`/veiculos/${id}`);
}

export async function listarVeiculos(): Promise<VeiculoPage> {
  return api<VeiculoPage>("/veiculos");
}

export async function criarVeiculo(data: VeiculoRequest): Promise<Veiculo> {
  return api<Veiculo>("/veiculos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarVeiculo(
  id: number,
  data: VeiculoRequest,
): Promise<Veiculo> {
  return api<Veiculo>(`/veiculos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletarVeiculo(id: number): Promise<void> {
  await api<void>(`/veiculos/${id}`, {
    method: "DELETE",
  });
}
