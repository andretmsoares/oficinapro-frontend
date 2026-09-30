import type { Cliente } from "../../src/types/cliente/cliente";
import type { OrdemDeServico } from "../../src/types/ordemDeServico/ordemDeServico";
import type { Pagamento } from "../../src/types/pagamento/pagamento";
import type { Usuario } from "../../src/types/usuario/usuario";

export const API = "http://api.test/api";

export function usuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: 1,
    nome: "Ana Gerente",
    telefone: "83988887777",
    documento: "12345678901",
    oficinaId: 7,
    username: "ana.gerente",
    role: "GERENTE",
    bloqueado: false,
    ...overrides,
  };
}

export const gerente = (o: Partial<Usuario> = {}) =>
  usuario({ role: "GERENTE", ...o });

export const mecanico = (o: Partial<Usuario> = {}) =>
  usuario({
    id: 2,
    nome: "Carlos Mecanico",
    username: "carlos.mec",
    role: "MECANICO",
    ...o,
  });

export const adminSaas = (o: Partial<Usuario> = {}) =>
  usuario({
    id: 3,
    nome: "Admin SaaS",
    username: "admin.saas",
    role: "ADMIN",
    oficinaId: null,
    ...o,
  });

export function cliente(overrides: Partial<Cliente> = {}): Cliente {
  return {
    id: 1,
    nome: "JOAO SILVA",
    documento: "12345678901",
    telefone: "83988887777",
    oficinaId: 7,
    ...overrides,
  };
}

export function ordemDeServico(
  overrides: Partial<OrdemDeServico> = {},
): OrdemDeServico {
  return {
    id: 1,
    oficinaId: 7,
    unidadeId: 1,
    veiculoId: 1,
    clienteId: 1,
    mecanicoId: 1,
    dataAbertura: "2026-01-15T10:00:00",
    dataFechamento: null,
    status: "ABERTA",
    obs: "Revisão geral",
    valorTotal: 50000,
    desconto: 0,
    valorComDesconto: 50000,
    placaVeiculo: "ABC1234",
    nomeCliente: "JOAO SILVA",
    unidadeNome: "UNIDADE CENTRAL",
    oficinaNome: "OFICINA TESTE",
    mecanico: "CARLOS",
    ...overrides,
  };
}

export function pagamento(overrides: Partial<Pagamento> = {}): Pagamento {
  return {
    id: 10,
    osId: 1,
    valorTotal: 50000,
    valorPago: 0,
    valorPendente: 50000,
    status: "PAGAMENTO_PENDENTE",
    dataPagamentoTotal: null,
    obs: "",
    ...overrides,
  };
}

/** Resposta paginada no formato do Spring Data. */
export function pagina<T>(content: T[], totalPages = 1) {
  return {
    content,
    totalElements: content.length,
    totalPages,
    size: 20,
    number: 0,
    first: true,
    last: totalPages <= 1,
  };
}
