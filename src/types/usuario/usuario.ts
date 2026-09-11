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
/**
 * Usuário autenticado na sessão atual (contexto de UI/rotas).
 * Reaproveita o Role real do backend — ver observação na resposta.
 *   ADMIN    -> admin global do SaaS (Oficinas + Usuários de todas oficinas)
 *   GERENTE  -> admin da própria oficina (+ tela "Usuários" da oficina)
 *   MECANICO -> usuário comum (sem acesso a "Usuários")
 */
export interface UsuarioLogado {
  id: number;
  nome: string;
  role: Role;
  oficinaId: number | null; // null só faz sentido para role === "ADMIN"
}
