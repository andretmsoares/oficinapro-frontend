import { defineFields } from "../../components/EntityForm/types";

export type PecaFormData = {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  osId: number;
};

export function createPecaFields(lockedOsId?: number) {
  return defineFields<PecaFormData>([
    {
      name: "nome",
      label: "Nome",
      placeholder: "Digite o nome da peça",
      type: "text",
      required: true,
    },
    {
      name: "quantidade",
      label: "Quantidade",
      placeholder: "Digite a quantidade de peças",
      type: "number",
      required: true,
    },
    {
      name: "valorUnitario",
      label: "Valor Unitário",
      placeholder: "Digite o valor unitário da peça",
      type: "currency",
      required: true,
    },
    {
      name: "osId",
      label: "Ordem de Serviço (Id)",
      placeholder: "Digite o ID da ordem de serviço",
      type: "number",
      required: true,
      readOnly: lockedOsId !== undefined,
    },
  ]);
}

export const pecasFields = createPecaFields();
