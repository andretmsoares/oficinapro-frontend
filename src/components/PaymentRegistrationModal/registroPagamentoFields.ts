import { defineFields } from "../EntityForm/types";
import { formatCurrencyDisplay } from "../../services/formatters";
import type { MeioDePagamento } from "../../types/pagamento/pagamento";

export type RegistroPagamentoFormData = {
  valorPago: number;
  meioPagamento: MeioDePagamento;
};

export function createRegistroPagamentoFields(saldoRestante: number) {
  return defineFields<RegistroPagamentoFormData>([
    {
      name: "valorPago",
      label: "Valor Pago",
      type: "currency",
      required: true,
      validate: (value) => {
        const valor = Number(value);
        if (valor > saldoRestante) {
          return `Valor máximo permitido: ${formatCurrencyDisplay(saldoRestante)}`;
        }
        return undefined;
      },
    },
    {
      name: "meioPagamento",
      label: "Meio de Pagamento",
      type: "select",
      required: true,
      options: [
        { label: "Dinheiro", value: "DINHEIRO" },
        { label: "PIX", value: "PIX" },
        { label: "Cartão de Crédito", value: "CARTAO_CREDITO" },
        { label: "Cartão de Débito", value: "CARTAO_DEBITO" },
        { label: "Cheque", value: "CHEQUE" },
      ],
    },
  ]);
}
