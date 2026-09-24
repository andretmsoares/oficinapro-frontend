import { api } from "./api";
import type { RegistroPagamento } from "../types/registroPagamento/registroPagamento";
import type { MeioPagamento } from "../enums/MeioPagamento";

export interface RegistroPagamentoRequest {
  pagamentoId: number;
  valor: number;
  meioPagamento: MeioPagamento;
}

export async function criarRegistroPagamento(
  data: RegistroPagamentoRequest,
): Promise<RegistroPagamento> {
  return api<RegistroPagamento>("/registros-pagamento", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function buscarRegistroPagamentoPorId(
  id: number,
): Promise<RegistroPagamento> {
  return api<RegistroPagamento>(`/registros-pagamento/${id}`);
}

export async function listarRegistrosPorPagamento(
  pagamentoId: number,
): Promise<RegistroPagamento[]> {
  return api<RegistroPagamento[]>(
    `/registros-pagamento/pagamento/${pagamentoId}`,
  );
}

export async function deletarRegistroPagamento(id: number): Promise<void> {
  await api<void>(`/registros-pagamento/${id}`, {
    method: "DELETE",
  });
}
