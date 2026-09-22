export interface OficinaComEstatisticas {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string | null;
  ativo: boolean;
  totalClientes: number;
  totalVeiculos: number;
  totalOrdensServico: number;
}
