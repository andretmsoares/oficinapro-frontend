import { defineFields } from "../../components/EntityForm/types";

export type PecaFormData = {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  osId: number;
};

export function createPecaFields(lockedOsId?: number) {
  return defineFields<PecaFormData>([
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "quantidade", label: "Quantidade", type: "number", required: true },
    {
      name: "valorUnitario",
      label: "Valor Unitário",
      type: "currency",
      required: true,
    },
    {
      name: "osId",
      label: "Ordem de Serviço (Id)",
      type: "number",
      required: true,
      readOnly: lockedOsId !== undefined,
    },
  ]);
}

export const pecasFields = createPecaFields();
