import type { StatusPagamento } from "../types/pagamento/pagamento";

export function getPagamentoStatus(
  valorPago: number,
  valorTotal: number,
): StatusPagamento {
  if (valorPago <= 0) return "PENDENTE";
  if (valorPago >= valorTotal) return "PAGO";
  return "PARCIAL";
}
