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

export interface PagamentoPage {
  content: Pagamento[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** Totais da oficina somados no banco: não dependem da página exibida. */
export interface PagamentoResumo {
  totalRecebido: number;
  valorAReceber: number;
  pendentes: number;
}

/**
 * Uma página dos pagamentos da oficina. A busca (parte do número da OS) e o filtro de status são
 * feitos no servidor sobre TODOS os pagamentos.
 */
export async function buscarPagamentosPaginado(
  oficinaId: number,
  termo: string,
  status: StatusPagamento | "",
  page = 0,
  size = 20,
): Promise<PagamentoPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (termo.trim()) {
    params.set("q", termo.trim());
  }

  if (status) {
    params.set("status", status);
  }

  return api<PagamentoPage>(
    `/pagamentos/oficina/${oficinaId}?${params.toString()}`,
  );
}

export async function buscarResumoPagamentos(
  oficinaId: number,
): Promise<PagamentoResumo> {
  return api<PagamentoResumo>(`/pagamentos/oficina/${oficinaId}/resumo`);
}

/** Pagamentos só das OS informadas (as da página que a tela está mostrando; até 100). */
export async function buscarPagamentosPorOsIds(
  oficinaId: number,
  osIds: number[],
): Promise<Pagamento[]> {
  if (osIds.length === 0) {
    return [];
  }

  return api<Pagamento[]>(
    `/pagamentos/oficina/${oficinaId}/por-os?osIds=${osIds.join(",")}`,
  );
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
