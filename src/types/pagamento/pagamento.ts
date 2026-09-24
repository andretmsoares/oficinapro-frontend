import type { StatusPagamento } from "../../enums/StatusPagamento";
export interface Pagamento {
  id: number;
  osId: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  status: StatusPagamento;
  dataPagamentoTotal: string | null;
  obs: string;
}
export interface PagamentoUpdateRequest {
  obs: string;
}
