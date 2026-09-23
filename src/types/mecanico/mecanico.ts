export interface Mecanico {
  id: number;
  nome: string;
  telefone: string | null;
  documento: string | null;
  oficinaId: number;
  salario: number;
  obs: string | null;
}

export interface MecanicoRequest {
  nome: string;
  telefone: string;
  documento: string;
  salario: number;
  obs: string;
}
