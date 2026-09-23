export const StatusOrdemDeServico = {
  ABERTA: "ABERTA",
  DIAGNOSTICO: "DIAGNOSTICO",
  AGUARDANDO_APROVACAO: "AGUARDANDO_APROVACAO",
  AGUARDANDO_PECAS: "AGUARDANDO_PECAS",
  EM_EXECUCAO: "EM_EXECUCAO",
  FINALIZADA: "FINALIZADA",
  ENTREGUE: "ENTREGUE",
  FECHADA: "FECHADA",
  CANCELADA: "CANCELADA",
} as const;

export type StatusOrdemDeServico =
  (typeof StatusOrdemDeServico)[keyof typeof StatusOrdemDeServico];
