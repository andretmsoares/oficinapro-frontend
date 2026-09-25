import type { StatusOrdemDeServico } from "../../enums/StatusOrdemDeServico";

export type OrdemDeServico = {
  id: number;
  oficinaId: number;
  unidadeId: number;
  veiculoId: number;
  clienteId: number | null;
  mecanicoId: number | null;
  dataAbertura: string;
  dataFechamento: string | null;
  status: StatusOrdemDeServico;
  obs: string;
  valorTotal: number;
  desconto: number;
  valorComDesconto: number;
  placaVeiculo: string;
  nomeCliente: string;
  unidadeNome: string;
  oficinaNome: string;
  mecanicoNome: string;
};

export type OrdemDeServicoRequest = {
  unidadeId: number;
  veiculoId: number;
  clienteId: number | null;
  mecanicoId: number | null;
  obs: string;
};

export type AtualizarStatusOSRequest = {
  status: string;
};

export type AtribuirMecanicoRequest = {
  mecanicoId: number;
};

export type AtribuirClienteRequest = {
  clienteId: number;
};

export type FluxoMensalOS = {
  day: number;
  abertas: number;
  finalizadas: number;
};

export const STATUS_ORDEM_LABELS: Record<string, string> = {
  ABERTA: "Aberta",
  DIAGNOSTICO: "Diagnóstico",
  AGUARDANDO_APROVACAO: "Aguardando Aprovação",
  AGUARDANDO_PECAS: "Aguardando Peças",
  EM_EXECUCAO: "Em Execução",
  FINALIZADA: "Finalizada",
  ENTREGUE: "Entregue",
  FECHADA: "Fechada",
  CANCELADA: "Cancelada",
};
