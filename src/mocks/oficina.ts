import type { Oficina } from "../types/oficina/oficina";

export const MOCK_OFICINAS: Oficina[] = [
  {
    id: 1,
    nome: "Oficina Central",
    cnpj: "12345678000190",
    telefone: "83988887777",
    totalClientes: 152,
    totalVeiculos: 87,
    totalOrdensServico: 324,
  },
  {
    id: 2,
    nome: "Oficina Norte",
    cnpj: "98765432000155",
    telefone: "83987776666",
    totalClientes: 64,
    totalVeiculos: 40,
    totalOrdensServico: 118,
  },
];
