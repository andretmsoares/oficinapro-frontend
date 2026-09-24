export const StatusPagamento = {
  PAGAMENTO_PENDENTE: "PAGAMENTO_PENDENTE",
  PAGO_PARCIALMENTE: "PAGO_PARCIALMENTE",
  PAGA: "PAGA",
} as const;

export type StatusPagamento =
  (typeof StatusPagamento)[keyof typeof StatusPagamento];
