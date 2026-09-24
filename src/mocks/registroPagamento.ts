import { MeioPagamento } from "../enums/MeioPagamento";
import type { RegistroPagamento } from "../types/registroPagamento/registroPagamento";

export const MOCK_REGISTROS_PAGAMENTO: RegistroPagamento[] = [
  {
    id: 1,
    pagamentoId: 1,
    valor: 500,
    meioPagamento: MeioPagamento.CARTAO_CREDITO,
    data: "2026-09-01T10:30:00",
  },
  {
    id: 2,
    pagamentoId: 1,
    valor: 500,
    meioPagamento: MeioPagamento.DINHEIRO,
    data: "2026-09-03T14:20:00",
  },

  {
    id: 3,
    pagamentoId: 2,
    valor: 800,
    meioPagamento: MeioPagamento.DINHEIRO,
    data: "2026-09-02T11:15:00",
  },

  {
    id: 4,
    pagamentoId: 4,
    valor: 500,
    meioPagamento: MeioPagamento.PIX,
    data: "2026-09-03T09:30:00",
  },
];
