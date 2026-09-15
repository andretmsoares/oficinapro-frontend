import { defineFields } from "../../EntityForm/types";

export type MaoDeObraFormData = {
  descricao: string;
  valor: number;
  osId: number;
};

export function createMaoDeObraFields() {
  return defineFields<MaoDeObraFormData>([
    {
      name: "descricao",
      label: "Descrição",
      placeholder: "Digite a descrição da mão de obra",
      type: "text",
      required: true,
    },
    {
      name: "valor",
      label: "Valor",
      placeholder: "Digite o valor da mão de obra",
      type: "currency",
      required: true,
    },
    {
      name: "osId",
      label: "Ordem de Serviço (Id)",
      placeholder: "Digite o ID da ordem de serviço",
      type: "number",
      required: true,
      readOnly: true,
    },
  ]);
}
