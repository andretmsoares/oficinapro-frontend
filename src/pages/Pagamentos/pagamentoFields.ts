import { defineFields } from "../../components/EntityForm/types";

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
