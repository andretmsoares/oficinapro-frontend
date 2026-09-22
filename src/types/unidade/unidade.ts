export interface Unidade {
  id: number;
  oficinaId: number;
  nome: string;
  endereco: string;
  telefone: string | null;
}

export interface UnidadeRequest {
  nome: string;
  endereco: string;
  telefone: string;
}
