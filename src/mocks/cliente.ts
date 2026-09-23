import type { Cliente } from "../types/cliente/cliente";

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 1,
    nome: "Carlos Eduardo Silva",
    documento: "123.456.789-00",
    telefone: "(83) 98888-1111",
    oficinaId: 1,
  },
  {
    id: 2,
    nome: "Mariana Souza Santos",
    documento: "987.654.321-11",
    telefone: "(83) 99999-2222",
    oficinaId: 1,
  },
  {
    id: 3,
    nome: "Roberto Alves Costa",
    documento: "456.789.123-22",
    telefone: "(83) 97777-3333",
    oficinaId: 1,
  },
  {
    id: 4,
    nome: "Fernanda Lima Oliveira",
    documento: "321.654.987-33",
    telefone: "(83) 96666-4444",
    oficinaId: 1,
  },
];
