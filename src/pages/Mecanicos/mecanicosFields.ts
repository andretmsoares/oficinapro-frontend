import { defineFields } from "../../components/EntityForm/types";

export type MecanicoFormData = {
  nome: string;
  documento: string;
  telefone: string;
  salario: number;
  obs: string;
};

export const mecanicoFields = defineFields<MecanicoFormData>([
  { name: "nome", label: "Nome", type: "text", required: true },
  { name: "documento", label: "CPF/CNPJ", type: "document", required: true },
  { name: "telefone", label: "Telefone", type: "phone", required: true },
  { name: "salario", label: "Salário", type: "number" },
  { name: "obs", label: "Observações", type: "textarea" },
]);
