import type { StatusPagamento } from "../enums/StatusPagamento";

export function getPagamentoStatus(
  valorPago: number,
  valorTotal: number,
): StatusPagamento {
  if (valorPago <= 0) return "PAGAMENTO_PENDENTE";
  if (valorPago >= valorTotal) return "PAGA";
  return "PAGO_PARCIALMENTE";
}
