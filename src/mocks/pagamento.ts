import { StatusPagamento } from "../enums/StatusPagamento";
import type { Pagamento } from "../types/pagamento/pagamento";

export const MOCK_PAGAMENTOS: Pagamento[] = [
  {
    id: 1,
    osId: 1,
    valorTotal: 800,
    valorPago: 500,
    valorPendente: 300,
    status: StatusPagamento.PAGO_PARCIALMENTE,
    obs: "Pagamento realizado parcialmente.",
    dataPagamentoTotal: "20/02/2025",
  },
  {
    id: 2,
    osId: 2,
    valorTotal: 800,
    valorPago: 500,
    valorPendente: 300,
    status: StatusPagamento.PAGO_PARCIALMENTE,
    obs: "Pagamento realizado parcialmente.",
    dataPagamentoTotal: "20/02/2025",
  },
  {
    id: 3,
    osId: 3,
    valorTotal: 800,
    valorPago: 500,
    valorPendente: 300,
    status: StatusPagamento.PAGO_PARCIALMENTE,
    obs: "Pagamento realizado parcialmente.",
    dataPagamentoTotal: "20/02/2025",
  },
  {
    id: 4,
    osId: 4,
    valorTotal: 800,
    valorPago: 500,
    valorPendente: 300,
    status: StatusPagamento.PAGO_PARCIALMENTE,
    obs: "Pagamento realizado parcialmente.",
    dataPagamentoTotal: "20/02/2025",
  },
];
