import type { Pagamento } from "../types/pagamento/pagamento";

export const MOCK_PAGAMENTOS: Pagamento[] = [
  {
    id: 1,
    osId: 1,
    valorTotal: 800,
    valorPago: 500,
    status: "PARCIAL",
    obs: "Pagamento realizado parcialmente.",
  },
  {
    id: 2,
    osId: 2,
    valorTotal: 450,
    valorPago: 450,
    status: "PAGO",
    obs: "",
  },
  {
    id: 3,
    osId: 3,
    valorTotal: 1100,
    valorPago: 0,
    status: "PENDENTE",
    obs: "Pagamento será realizado na retirada do veículo.",
  },
  {
    id: 4,
    osId: 4,
    valorTotal: 2000,
    valorPago: 1000,
    status: "PARCIAL",
    obs: "Entrada paga na abertura da OS.",
  },
];
