import { defineFields } from "../../components/EntityForm/types";
import type { MeioDePagamento } from "../../types/pagamento/pagamento";

export type PagamentoFormData = {
  osId: number;
  obs: string;
};

export const pagamentoFields = defineFields<PagamentoFormData>([
  {
    name: "osId",
    label: "ID da Ordem de Servico",
    type: "number",
    required: true,
  },
  {
    name: "obs",
    label: "Observações",
    type: "textarea",
  },
]);

export type RegistroPagamentoFormData = {
  valorPago: number;
  meioPagamento: MeioDePagamento;
};

export const registroPagamentoFields = defineFields<RegistroPagamentoFormData>([
  {
    name: "valorPago",
    label: "Valor Pago",
    type: "currency",
    required: true,
  },
  {
    name: "meioPagamento",
    label: "Meio de Pagamento",
    type: "select",
    options: [
      { label: "Dinheiro", value: "DINHEIRO" },
      { label: "PIX", value: "PIX" },
      { label: "Cartão de Crédito", value: "CARTAO_CREDITO" },
      { label: "Cartão de Débito", value: "CARTAO_DEBITO" },
      { label: "Cheque", value: "CHEQUE" },
    ],
    required: true,
  },
]);
