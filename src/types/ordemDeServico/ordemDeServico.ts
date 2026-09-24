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
