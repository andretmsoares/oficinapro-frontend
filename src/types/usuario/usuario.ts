import type { Role } from "./role";

export interface Usuario {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  role: Role;
  oficinaId: number | null; // null = admin global, sem oficina fixa
}
