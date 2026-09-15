import { defineFields } from "../../components/EntityForm/types";

export type PagamentoFormData = {
  osId: number;
  obs: string;
};

export const pagamentoFields = defineFields<PagamentoFormData>([
  {
    name: "osId",
    label: "ID da Ordem de Servico",
    placeholder: "Digite o ID da ordem de serviço",
    type: "number",
    required: true,
  },
  {
    name: "obs",
    label: "Observações",
    placeholder: "Deixe obervações quando necessário",
    type: "textarea",
  },
]);
