import type { StatusPagamento } from "../enums/StatusPagamento";

export function getPagamentoStatus(
  valorPago: number,
  valorTotal: number,
): StatusPagamento {
  if (valorPago <= 0) return "PENDENTE";
  if (valorPago >= valorTotal) return "PAGO";
  return "PARCIAL";
}
