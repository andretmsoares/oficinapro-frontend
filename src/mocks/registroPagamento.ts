import type { RegistroPagamento } from "../types/pagamento/pagamento";

export const MOCK_REGISTROS_PAGAMENTO: RegistroPagamento[] = [
  {
    id: 1,
    pagamentoId: 1,
    valor: 500,
    formaPagamento: "PIX",
    dataPagamento: "2026-09-01T10:30:00",
  },
  {
    id: 2,
    pagamentoId: 1,
    valor: 500,
    formaPagamento: "CARTAO_CREDITO",
    dataPagamento: "2026-09-03T14:20:00",
  },

  {
    id: 3,
    pagamentoId: 2,
    valor: 800,
    formaPagamento: "PIX",
    dataPagamento: "2026-09-02T11:15:00",
  },

  {
    id: 4,
    pagamentoId: 4,
    valor: 500,
    formaPagamento: "DINHEIRO",
    dataPagamento: "2026-09-03T09:30:00",
  },
];
