import type { Role } from "./role";

export interface Usuario {
  id: number;
  nome: string;
  telefone: string;
  documento: string;
  oficinaId: number | null;
  username: string;
  role: Role;
}
