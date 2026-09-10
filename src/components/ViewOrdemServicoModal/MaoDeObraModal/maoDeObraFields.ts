import { defineFields } from "../../EntityForm/types";

export type MaoDeObraFormData = {
  descricao: string;
  valor: number;
  osId: number;
};

export function createMaoDeObraFields() {
  return defineFields<MaoDeObraFormData>([
    { name: "descricao", label: "Descrição", type: "text", required: true },
    { name: "valor", label: "Valor", type: "currency", required: true },
    {
      name: "osId",
      label: "Ordem de Serviço (Id)",
      type: "number",
      required: true,
      readOnly: true,
    },
  ]);
}
