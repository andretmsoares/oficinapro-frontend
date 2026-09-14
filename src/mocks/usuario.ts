import type { Usuario } from "../types/usuario/usuario";

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 1,
    nome: "Carlos Eduardo Silva",
    documento: "12345678900",
    telefone: "83988881111",
    username: "carlos.silva",
    role: "GERENTE",
    oficinaId: 1,
  },
  {
    id: 2,
    nome: "João Pedro Alves",
    documento: "98765432111",
    telefone: "83999992222",
    username: "joao.alves",
    role: "MECANICO",
    oficinaId: 1,
  },
  {
    id: 3,
    nome: "Fernanda Souza",
    documento: "45678912233",
    telefone: "83988883333",
    username: "fernanda.souza",
    role: "MECANICO",
    oficinaId: 2,
  },
  {
    id: 4,
    nome: "Ana Paula Ribeiro",
    documento: "78912345644",
    telefone: "83988884444",
    username: "ana.ribeiro",
    role: "ADMIN",
    oficinaId: null,
  },
];
