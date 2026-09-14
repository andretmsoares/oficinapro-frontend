export interface Oficina {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  /**
   * MOCK — no backend real não existe como coluna da entidade Oficina.
   * Viria de uma agregação (COUNT via JOIN, ou endpoint de estatísticas
   * dedicado). Ver observação de pendência na resposta.
   */
  totalClientes: number;
  totalVeiculos: number;
  totalOrdensServico: number;
}
