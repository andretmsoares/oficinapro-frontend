export interface Cliente {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
  oficinaId: number;
}

export interface ClienteRequest {
  nome: string;
  telefone: string;
  documento: string;
}
