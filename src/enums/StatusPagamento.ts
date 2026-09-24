export const StatusPagamento = {
  PAGAMENTO_PENDENTE: "PENDENTE",
  PAGO_PARCIALMENTE: "PARCIAL",
  PAGA: "PAGO",
} as const;

export type StatusPagamento =
  (typeof StatusPagamento)[keyof typeof StatusPagamento];
