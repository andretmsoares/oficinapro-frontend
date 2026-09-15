import { defineFields } from "../../components/EntityForm/types";

export type MecanicoFormData = {
  nome: string;
  documento: string;
  telefone: string;
  salario: number;
  obs: string;
};

export const mecanicoFields = defineFields<MecanicoFormData>([
  {
    name: "nome",
    label: "Nome",
    placeholder: "Digite o nome do mecânico",
    type: "text",
    required: true,
  },
  {
    name: "documento",
    label: "CPF",
    placeholder: "Digite o CPF do mecânico",
    type: "document",
    required: true,
  },
  {
    name: "telefone",
    label: "Telefone",
    placeholder: "Digite o telefone do mecânico",
    type: "phone",
    required: true,
  },
  {
    name: "salario",
    label: "Salário",
    placeholder: "Digite o salário do mecânico",
    type: "currency",
  },
  {
    name: "obs",
    label: "Observações",
    placeholder: "Digite observações quando necessário",
    type: "textarea",
  },
]);
