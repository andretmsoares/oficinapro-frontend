export interface Unidade {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  /**
   * Presente aqui apenas para permitir o filtro client-side com mocks
   * (ver Usuario.oficinaId, mesmo padrão). O backend real deve resolver
   * a oficina do usuário autenticado via contexto de sessão — nunca
   * confiar em oficinaId vindo do frontend para determinar escopo.
   */
  oficinaId: number;
}
