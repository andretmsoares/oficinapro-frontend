export interface OrdemDeServico {
  id: number;
  oficinaId: number;
  unidadeId: number;
  veiculoId: number;
  clienteId: number;
  mecanicoId: number;
  placaVeiculo: string;
  nomeCliente: string;
  dataAbertura: string;
  dataFechamento: string | null;
  status: string;
  obs: string;
  desconto: number;
  valorTotal: number;
  valorComDesconto: number;
}
