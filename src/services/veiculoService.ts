import { api } from "./api";
import type { Veiculo } from "../types/veiculo/veiculo";

export interface VeiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
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
