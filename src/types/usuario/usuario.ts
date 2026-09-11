export type PapelUsuario = "USUARIO" | "ADMIN" | "GERENTE";

export interface UsuarioLogado {
  id: number;
  nome: string;
  role: PapelUsuario;
  oficinaId: number | null; // null para Admin SaaS, que não pertence a uma oficina fixa
}
