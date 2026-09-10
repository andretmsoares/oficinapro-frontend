export type StatusPagamento = "PENDENTE" | "PARCIAL" | "PAGO";

export type MeioDePagamento =
  "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "CHEQUE";

export interface Pagamento {
  id: number;
  osId: number;
  valorTotal: number;
  valorPago: number;
  status: StatusPagamento;
  obs: string;
}

export interface RegistroPagamento {
  id: number;
  pagamentoId: number;
  valor: number;
  formaPagamento: string;
  dataPagamento: string;
}
