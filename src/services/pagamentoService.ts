import { api } from "./api";
import type {
  Pagamento,
  PagamentoUpdateRequest,
} from "../types/pagamento/pagamento";
import type { StatusPagamento } from "../enums/StatusPagamento";

export async function buscarPagamentoPorId(id: number): Promise<Pagamento> {
  return api<Pagamento>(`/pagamentos/${id}`);
}

export async function buscarPagamentoPorOsId(osId: number): Promise<Pagamento> {
  return api<Pagamento>(`/pagamentos/os/${osId}`);
}

export async function buscarPagamentosPorOficina(
  oficinaId: number,
): Promise<Pagamento[]> {
  return api<Pagamento[]>(`/pagamentos/oficina/${oficinaId}`);
}

export async function buscarPagamentosPorStatus(
  oficinaId: number,
  status: StatusPagamento,
): Promise<Pagamento[]> {
  return api<Pagamento[]>(`/pagamentos/oficina/${oficinaId}/status/${status}`);
}

export async function calcularValorParaReceber(
  oficinaId: number,
): Promise<number> {
  return api<number>(`/pagamentos/oficina/${oficinaId}/a-receber`);
}

export async function atualizarPagamento(
  id: number,
  data: PagamentoUpdateRequest,
): Promise<Pagamento> {
  return api<Pagamento>(`/pagamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
