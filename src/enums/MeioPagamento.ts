export const MeioPagamento = {
  PIX: "PIX",
  DINHEIRO: "DINHEIRO",
  CARTAO_CREDITO: "CARTÃO_CREDITO",
  CARTAO_DEBITO: "CARTÃO_DEBITO",
  CHEQUE: "CHEQUE",
} as const;

export type MeioPagamento = (typeof MeioPagamento)[keyof typeof MeioPagamento];
